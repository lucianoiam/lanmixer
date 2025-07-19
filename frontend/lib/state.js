// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useCallback, useEffect, useRef, useState }
   from '/lib/preact+htm.js';
import { hasCacheKey, removeCacheKey, getCacheValue, setCacheValue, cachedCall,
         clearCache }
   from '/lib/cache.js';

const { host, TrackType } = dawscript


export function useHostConnect() {
   const [isOnline, setOnline] = useState(false);

   useEffect(() => {
      dawscript.connect((status) => {
         setOnline(status);

         if (! status) {
            clearCache();
         }

         return true;
      });
   }, []);

   return isOnline;
}

// Performs RO calls
export function useHostCall(initial, call, target) {
   const returnType = typeof initial;

   const [value, setValue] =
      useState(getCacheValue(call, target, returnType) ?? initial);

   useAsyncEffect(async () => {
      if (! hasCacheKey(call, target)) {
         setValue(await cachedCall(call, target, returnType));
      }
   }, []);

   return value;
}

// Maps state to R/W calls with listener support
export function useHostState(initial, getFunc, setFunc, addListenerFunc,
      removeListenerFunc, target) {
   const [state, setState] =
      useState(getCacheValue(getFunc, target, typeof initial) ?? initial);
   const skipNextSetFuncCall = useRef(true); // do not send initial state

   const setStateLocalOnly = useCallback((newState) => {
      skipNextSetFuncCall.current = true;
      setCacheValue(getFunc, target, newState);
      setState(newState);
   }, []);

   useAsyncEffect(async () => {
      if (! hasCacheKey(getFunc, target)) {
         setStateLocalOnly(await getFunc(target));
      }
   }, []);

   useAsyncEffect(async () => {
      if (skipNextSetFuncCall.current) {
         skipNextSetFuncCall.current = false;
      } else {
         setCacheValue(getFunc, target, state);
         await setFunc(target, state);
      }
   }, [state]);

   useAsyncEffect(async () => {
      await addListenerFunc(target, setStateLocalOnly);

      return () => {
         removeListenerFunc(target, setStateLocalOnly);
         removeCacheKey(getFunc, target); // force call on next mount
      };
   }, []);

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
