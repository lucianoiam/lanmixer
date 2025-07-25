// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useCallback, useEffect, useState, useContext,
         createContext, createElement }
   from './react.js';
import { makeCacheKey, hasCacheKey, clearCache, precacheCallResult,
         useCachedState } 
   from './cache.js';

const { host, TrackType } = dawscript;

const SessionContext = createContext();


export function SessionProvider({ children }) {
   const value = useSessionState();
   return createElement(SessionContext.Provider, { value }, children);
}

export function useSession() {
   return useContext(SessionContext);
}

// TODO: prompt user to reload when an exception occurs
// Call getter once and cache result
export function useImmutableState(init, target, fn) {
   const key = makeCacheKey(fn, target); 
   const [state, setState] = useCachedState(init, key);

   useAsyncEffect(async () => {
      if (hasCacheKey(key)) {
         return;
      }

      try {
         setState(await fn(target));
      } catch (err) {
         dbg_err(err);
      }
   }, [key.hash]);

   return state;
}

// TODO: prompt user to reload when an exception occurs
// Call getter and add/remove listener on every remount
// fn: { get, set, addListener, removeListener }
export function useMutableState(init, target, fn) {
   const key = makeCacheKey(fn.get, target); 
   const [state, setState] = useCachedState(init, key);

   useAsyncEffect(async () => {
      try {
         await fn.addListener(target, setState);

         if (! hasCacheKey(key)) {
            setState(await fn.get(target));
         }
      } catch (err) {
         dbg_err(err);
      }

      return () => {
         fn.removeListener(target, setState)
            .catch(dbg_err);
      };
   }, [key.hash]);

   const setStateAndCallSetFn = useCallback(async (newState) => {
      setState(newState);
      await fn.set(target, newState);
   }, [target, fn.get]);

   return [state, setStateAndCallSetFn];
}

function useSessionState() {
   const [state, setState] = useState({
      id: 0,
      isOnline: false,
      mixer: {
         audioTracks: [],
         faderLabels: [],
         hasDetails: false
      }
   });

   useEffect(() => {
      let id = 0;

      dawscript.connect((isOnline) => {
         if (! isOnline) {
            setState((prev) => ({ ...prev, isOnline }));
            return true;
         }

         id++;
         setState((prev) => ({ ...prev, id, isOnline }));
            
         if (id > 1) { // auto reconnection?
            clearCache(); // full refresh
            const prevMixer = state.mixer;
            prevMixer.hasDetails = false;
            setState((prev) => ({ ...prev, mixer: prevMixer }));
         }

         (async () => {
            try {
               const mixer = await getMixerLayout();
               await precacheTracks(state.mixer.audioTracks);
               mixer.hasDetails = true;
               setState((prev) => ({ ...prev, mixer }));
            } catch (err) {
               // TODO: prompt user to reload when an exception occurs
               dbg_err(err);
            }
         })();

         return true;
      });
   }, []);

   return state;
}

async function getMixerLayout() {
   const [audioTracks, faderLabels] = await Promise.all([
      host.getTracks().then(tracks =>
         Promise.all(tracks.map(async track => ({
            track,
            type: await host.getTrackType(track),
         })))
         .then(typed =>
            typed
               .filter(({ type }) => type === TrackType.AUDIO)
               .map(({ track }) => track)
         )
      ),
      host.getFaderLabels(),
   ]);

   return { audioTracks, faderLabels };
}

async function precacheTracks(tracks) {
   await Promise.all(tracks.map(track => precacheCallResult([
      [host.getTrackName, track],
      [host.getTrackVolume, track],
      [host.isTrackMute, track]
   ])));
}

function dbg_err(message) {
   console.error(`[state]     ${message}`);
}
