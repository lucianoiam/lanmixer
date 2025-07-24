// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useCallback, useEffect, useState, useContext,
         createContext, createElement }
   from './react.js';
import { buildCacheKey, hasCacheKey, clearCache, preCache, useCachedState } 
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

export function useImmutableState(init, target, getFn) {
   return useCachedFnCall(init, getFn, target)[0];
}

export function useMutableState(init, target, getFn, setFn, addListenerFn,
      removeListenerFn) {
   const [state, setState] = useCachedFnCall(init, getFn, target);
   const { dirtyState } = useSession();

   const setStateAndCallSetFn = useCallback(async (newState) => {
      setState(newState);
      await setFn(target, newState);
   }, [target, setFn]);

   useAsyncEffect(async () => {
      try {
         await addListenerFn(target, setState);
      } catch (err) {
         dbg_err(err);
      }

      return () => {
         removeListenerFn(target, setState).catch(dbg_err);
         const key = buildCacheKey(getFn, target);
         dirtyState.add(key.hash); // force getFn call on next mount
      };
   }, [target, getFn, addListenerFn, removeListenerFn]);

   return [state, setStateAndCallSetFn];
}

function useCachedFnCall(init, fn, arg) {
   const key = buildCacheKey(fn, arg); 
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
   }, [fn, arg]);

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
   await Promise.all(tracks.map(track => preCache([
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
