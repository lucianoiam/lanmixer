// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useCallback, useEffect, useRef, useState, useContext,
         createContext, createElement as elem }
   from '/lib/react.js';
import { buildCacheKey, hasCacheKey, clearCache, callWithCache, useCachedState } 
   from '/lib/cache.js';

const { host, TrackType } = dawscript;

const SessionContext = createContext();


export function SessionProvider({ children }) {
   const [state, setState] = useState({
      id: 0,
      isOnline: false,
      isTrackDetailsReady: false,
      dirtyState: new Set(),
      audioTracks: [],
      faderLabels: []
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
               const audioTracks = await getAudioTracks();
               const faderLabels = await host.getFaderLabels();

               setState((prev) => ({ ...prev, audioTracks, faderLabels }));

               for (const track of audioTracks) {
                  await precacheTrackDetails(track);
               }

               setState((prev) => ({ ...prev, isTrackDetailsReady: true }));
            })();
         }

         setState((prev) => ({ ...prev, id, isOnline }));

         return true;
      });
   }, []);

   return elem(SessionContext.Provider, { value: state }, children);
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
   const skipNextSetFnCall = useRef(true); // do not send init state

   const listener = useCallback((newState) => {
      skipNextSetFnCall.current = true;
      setState(newState);
   }, []);

   useAsyncEffect(async () => {
      try {
         await addListenerFn(target, listener);
      } catch (err) {
         dbg_err(err);
      }

      return () => {
         removeListenerFn(target, listener).catch(dbg_err);
         const key = buildCacheKey(getFn, target);
         dirtyState.add(key.hash); // force getFn call on next mount
      };
   }, []);

   useAsyncEffect(async () => {
      if (skipNextSetFnCall.current) {
         skipNextSetFnCall.current = false;
         return;
      }

      try {
         await setFn(target, state);
      } catch (err) {
         dbg_err(err);
      }
   }, [state]);

   return [state, setState];
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
   });

   return [state, setState];
}

async function getAudioTracks() {
   const tracks = [];

   for (const track of await host.getTracks()) {
      if (await host.getTrackType(track) == TrackType.AUDIO) {
         tracks.push(track);
      }
   }

   return tracks;
}

async function precacheTrackDetails(track) {
   await callWithCache(host.getTrackName, track);
   await callWithCache(host.getTrackVolume, track);
   await callWithCache(host.isTrackMute, track);
}

function dbg(message) {
   console.debug(`[state]     ${message}`);
}

function dbg_err(message) {
   console.error(`[state]     ${message}`);
}
