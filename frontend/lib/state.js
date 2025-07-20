// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useCallback, useEffect, useRef, useState }
   from '/lib/react.js';
import { buildCacheKey, hasCacheKey, clearCache, cachedCall, useCachedState } 
   from '/lib/cache.js';

const { host, TrackType } = dawscript
const dirtyState = new Set();

let userReload = false;

window.addEventListener('beforeunload', () => userReload = true);


// FIXME: allow to call from multiple places, rename to useHostIsOnline.
export function useHostConnect() {
   const [isOnline, setOnline] = useState(false);

   useEffect(() => {
      dawscript.connect((status) => {
         setOnline(status);

         userReload = false; // FIXME
         if (! status && ! userReload) {
            clearCache();
         }

         return true;
      });
   }, []);

   return isOnline;
}

export function useHostCall(init, call, target) {
   return useHostCallROWithCache(init, call, target)[0];
}

export function useHostState(init, getFunc, setFunc, addLstFunc, removeLstFunc,
      target) {
   const [state, setState] = useHostCallROWithCache(init, getFunc, target);
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

export function useAudioTracks() {
   return useHostCall([], async () => {
      const tracks = [];

      for (const track of await cachedCall(host.getTracks)) {
         const type = await cachedCall(host.getTrackType, track);

         if (type == TrackType.AUDIO) {
            tracks.push(track);
         }
      }

      return tracks;
   });
}

export function useMixerStateIsReady() {
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

function useHostCallROWithCache(init, call, target) {
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
   }, []);

   return [state, setState];
}
