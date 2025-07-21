// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useCallback, useEffect, useRef, useState, useContext,
         createContext, createElement as elem }
   from '/lib/react.js';
import { buildCacheKey, hasCacheKey, clearCache, callWithCache, useCachedState } 
   from '/lib/cache.js';

const { host, TrackType } = dawscript;

const g = { dirtyState: new Set() };
const DawscriptContext = createContext();


export function ConnectionProvider({ children }) {
   const [state, setState] = useState({ isOnline: false, sessionId: 0 });

   useEffect(() => {
      let sessionId = 0;
      let isUserReload = false;

      window.addEventListener('beforeunload', () => isUserReload = true);

      dawscript.connect((isOnline) => {
         if (isUserReload) {
            return false; // do not clear cache or try to reconnect
         }

         if (isOnline) {
            sessionId++;

            if (sessionId > 1) {
               clearCache(); // clear on automatic reconnection
            }
         }

         setState({ isOnline, sessionId });

         return true;
      });
   }, []);

   return elem(DawscriptContext.Provider, { value: state }, children);
}

export function useConnected() {
   const dsState = useContext(DawscriptContext);

   if (dsState === undefined) {
      throw new Error('useConnected must be used within a ConnectionProvider');
   }

   return dsState.isOnline;
}

export function useMixerReady() {
   const [isReady, setReady] = useState(false);
   const tracks = useAudioTracks();

   useAsyncEffect(async () => {
      if (tracks.length > 0) {
         for (const track of tracks) {
            await callWithCache(host.getTrackName, track);
            await callWithCache(host.getTrackVolume, track);
            await callWithCache(host.isTrackMute, track);
         }

         setReady(true);
      }
   }, [tracks]);

   return isReady;
}

export function useAudioTracks() {
   const { sessionId } = useContext(DawscriptContext);

   return useImmutableState([], null, async () => {
      const tracks = [];

      for (const track of await callWithCache(host.getTracks, null, 'object')) {
         const type = await callWithCache(host.getTrackType, track);

         if (type == TrackType.AUDIO) {
            tracks.push(track);
         }
      }

      return tracks;
   }, [sessionId]);
}

export function useImmutableState(init, target, getFn, deps) {
   return useGetFnCall(init, getFn, target, deps)[0];
}

export function useMutableState(init, target, getFn, setFn, addListenerFn,
      removeListenerFn, deps) {
   const [state, setState] = useGetFnCall(init, getFn, target, deps);
   const skipNextSetFnCall = useRef(true); // do not send init state

   const listener = useCallback((newState) => {
      skipNextSetFnCall.current = true;
      setState(newState);
   }, []);

   useAsyncEffect(async () => {
      await addListenerFn(target, listener);

      return () => {
         removeListenerFn(target, listener);
         const key = buildCacheKey(getFn, target);
         g.dirtyState.add(key.hash); // force getFn call on next mount
      };
   }, []);

   useAsyncEffect(async () => {
      if (skipNextSetFnCall.current) {
         skipNextSetFnCall.current = false;
         return;
      }

      await setFn(target, state);
   }, [state]);

   return [state, setState];
}

function useGetFnCall(init, fn, arg, deps) {
   const key = buildCacheKey(fn, arg); 
   const [state, setState] = useCachedState(init, key);

   useAsyncEffect(async () => {
      if (! hasCacheKey(key) || g.dirtyState.has(key.hash)) {
         g.dirtyState.delete(key.hash);
         const result = await fn(arg);

         // Workaround for the asymmetry between the volume getter and setter
         // values in dB caused by the conversion curves.
         // dawscript bug: set_track_volume(vol); get_track_volume() == ~vol
         if ((fn.name == 'getTrackVolume')
               && (Math.abs(state - result) < 2/*dB*/)) {
            return;
         }

         setState(result);
      }
   }, deps);

   return [state, setState];
}
