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
   const [state, setState] = useState({
      id: 0,
      isOnline: false,
      isMixerReady: false,
      audioTracks: [],
      faderLabels: [],
      dirtyState: new Set()
   });

   useEffect(() => {
      let id = 0;

      dawscript.connect((isOnline) => {
         if (isOnline) {
            id++;

            if (id > 1) { // auto reconnection?
               clearCache(); // full refresh
            }

            (async () => {
               const { audioTracks, faderLabels } = await getMixerLayout(); 
               setState((prev) => ({ ...prev, audioTracks, faderLabels }));
               await precacheTracks(audioTracks);
               setState((prev) => ({ ...prev, isMixerReady: true }));
            })();
         }

         setState((prev) => ({ ...prev, id, isOnline }));

         return true;
      });
   }, []);

   return createElement(SessionContext.Provider, { value: state }, children);
}

export function useSession() {
   return useContext(SessionContext);
}

export function useImmutableState(init, target, fn) {
   return useCachedFnCall(init, fn, target)[0];
}

// fn: { get, set, addListener, removeListener }
export function useMutableState(init, target, fn) {
   const [state, setState] = useCachedFnCall(init, fn.get, target);
   const { dirtyState } = useSession();

   const setStateAndCallSetFn = useCallback(async (newState) => {
      setState(newState);
      await fn.set(target, newState);
   }, [target, fn.get]);

   useAsyncEffect(async () => {
      try {
         await fn.addListener(target, setState);
      } catch (err) {
         dbg_err(err);
      }

      return () => {
         fn.removeListener(target, setState).catch(dbg_err);
         const key = makeCacheKey(fn.get, target);
         dirtyState.add(key.hash); // force getFn call on next mount
      };
   }, [target, fn.get]);

   return [state, setStateAndCallSetFn];
}

function useCachedFnCall(init, fn, arg) {
   const key = makeCacheKey(fn, arg); 
   const [state, setState] = useCachedState(init, key);
   const { dirtyState } = useSession();

   useAsyncEffect(async () => {
      if (hasCacheKey(key)) {
         if (! dirtyState.has(key.hash)) {
            return;
         }
         
         dirtyState.delete(key.hash);
      }

      try {
         setState(await fn(arg));
      } catch (err) {
         dbg_err(err);
      }
   }, [key.hash]);

   return [state, setState];
}

async function getMixerLayout() {
   const tracks = await host.getTracks();
   const audioTracks = (await Promise.all(
      tracks.map(async (track) => ({
         track,
         type: await host.getTrackType(track),
      }))
   ))
      .filter(({ type }) => type === TrackType.AUDIO)
      .map(({ track }) => track);

   const faderLabels = await host.getFaderLabels();
   return { audioTracks, faderLabels };
}

async function precacheTracks(tracks) {
   await Promise.all(tracks.map(track => precacheCallResult([
      [host.getTrackName, track],
      [host.getTrackVolume, track],
      [host.isTrackMute, track]
   ])));
}

function dbg(message) {
   console.debug(`[state]     ${message}`);
}

function dbg_err(message) {
   console.error(`[state]     ${message}`);
}
