// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useCallback, useEffect, useRef, useState }
   from '/lib/preact+htm.js';
import { getCacheValue, setCacheValue, clearCache, cachedCall, useCachedCall }
   from '/lib/cache.js';

const { host, TrackType } = dawscript


export const useHostCall = useCachedCall;

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

export function useHostState(initial, getFunc, setFunc, addListenerFunc,
      removeListenerFunc, target) {
   const initialCachedState = getCacheValue(getFunc, target, typeof initial);
   const [state, setState] = useState(initialCachedState ?? initial);
   const skipNextSetFuncCall = useRef(true); // do not send initialCachedState

   const setStateLocalOnly = useCallback((newState) => {
      skipNextSetFuncCall.current = true;
      setCacheValue(getFunc, target, newState);
      setState(newState);
   }, []);

   // Always refresh on mount so changes from other clients during the unmounted
   // state are picked up, as listeners are disconnected on unmount.
   useAsyncEffect(async () => {
      setStateLocalOnly(await getFunc(target));
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
      };
   }, []);

   return [state, setState];
}

export function useInitStateIsReady() {
   const [isReady, setReady] = useState(false);
   const tracks = useAudioTracks();

   useAsyncEffect(async () => {
      for (const track of tracks) {
         await cachedCall(host.getTrackName, track);
         await cachedCall(host.getTrackVolume, track);
         await cachedCall(host.isTrackMute, track);
      }

      if (tracks.length > 0) {
         setReady(true);
      }
   }, [tracks]);

   return isReady;
}

export function useAudioTracks() {
   const audioTracks = useHostCall([], async () => {
      const tracks = [];

      for (const track of await cachedCall(host.getTracks)) {
         const type = await cachedCall(host.getTrackType, track);

         if (type == TrackType.AUDIO) {
            tracks.push(track);
         }
      }

      // FIXME - dawscript bug: IDs are not stable on Bitwig and Live
      console.info(tracks);

      return tracks;
   });

   return audioTracks;
}
