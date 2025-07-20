// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useCallback, useEffect, useRef, useState, useContext,
         createContext, createElement as elem }
   from '/lib/react.js';
import { enableCacheDebugMessages, buildCacheKey, hasCacheKey, clearCache,
         cachedCall, useCachedState } 
   from '/lib/cache.js';

const { host, TrackType } = dawscript

const dirtyState = new Set();
const DawscriptContext = createContext();

enableCacheDebugMessages();
dawscript.enableDebugMessages();


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
            await cachedCall(host.getTrackName, track);
            await cachedCall(host.getTrackVolume, track);
            await cachedCall(host.isTrackMute, track);
         }

         setReady(true);
      }
   }, [tracks]);

   return isReady;
}

export function useAudioTracks() {
   const { sessionId } = useContext(DawscriptContext);

   return useHostCall([], async () => {
      const tracks = [];

      for (const track of await cachedCall(host.getTracks, null, 'object')) {
         const type = await cachedCall(host.getTrackType, track);

         if (type == TrackType.AUDIO) {
            tracks.push(track);
         }
      }

      return tracks;
   }, [sessionId]);
}

export function useHostCall(init, call, target, deps) {
   return useHostCallROWithCache(init, call, target, deps)[0];
}

export function useHostState(init, getFunc, setFunc, addLstFunc, removeLstFunc,
      target, deps) {
   const [state, setState] = useHostCallROWithCache(init, getFunc, target, deps);
   const skipNextSetFuncCall = useRef(true); // do not send init state

   const listener = useCallback((newState) => {
      skipNextSetFuncCall.current = true;
      setState(newState);
   }, []);

   useAsyncEffect(async () => {
      await addLstFunc(target, listener);

      return () => {
         removeLstFunc(target, listener);
         const key = buildCacheKey(getFunc, target);
         dirtyState.add(key.hash); // force call on next mount
      };
   }, []);

   useAsyncEffect(async () => {
      if (skipNextSetFuncCall.current) {
         skipNextSetFuncCall.current = false;
         return;
      }

      await setFunc(target, state);
   }, [state]);

   return [state, setState];
}

function useHostCallROWithCache(init, call, target, deps) {
   const key = buildCacheKey(call, target); 
   const [state, setState] = useCachedState(init, key);

   useAsyncEffect(async () => {
      if (! hasCacheKey(key) || dirtyState.has(key.hash)) {
         dirtyState.delete(key.hash);
         const result = await call(target);

         // Workaround for the asymmetry between the volume getter and setter
         // values in dB caused by the conversion curves.
         // dawscript bug: set_track_volume(vol); get_track_volume() == ~vol
         if ((call.name == 'getTrackVolume')
               && (Math.abs(state - result) < 2/*dB*/)) {
            return;
         }

         setState(result);
      }
   }, deps);

   return [state, setState];
}
