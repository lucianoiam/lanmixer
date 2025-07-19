// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useCallback, useEffect, useRef, useState } from '/lib/preact+htm.js';
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
   }, [getFunc, target]);

   // Listeners are disconnected on unmount. Always refresh on mount so changes
   // from other clients during the unmounted state are picked up.
   useEffect(() => {
      let mounted = true;

      (async () => {
         if (mounted) {
            setStateLocalOnly(await getFunc(target));
         }
      })();

      return () => {
         mounted = false;
      };
   }, [getFunc, setStateLocalOnly, target]);

   useEffect(() => {
      let mounted = true;

      (async () => {
         if (mounted) {
            if (skipNextSetFuncCall.current) {
               skipNextSetFuncCall.current = false;
            } else {
               setCacheValue(getFunc, target, state);
               await setFunc(target, state);
            }
         }
      })();

      return () => {
         mounted = false;
      };
   }, [getFunc, setFunc, state, target]);

   useEffect(() => {
      let mounted = true;

      (async () => {
         if (mounted) {
            await addListenerFunc(target, setStateLocalOnly);
         }
      })();

      return () => {
         mounted = false;
         removeListenerFunc(target, setStateLocalOnly);
      };
   }, [addListenerFunc, removeListenerFunc, setStateLocalOnly, target]);

   return [state, setState];
}

export function useInitStateIsReady() {
   const [isReady, setReady] = useState(false);
   const tracks = useAudioTracks();

   let mounted = true;

   useEffect(() => {
      (async () => {
         if (mounted) {
            for (const track of tracks) {
               await cachedCall(host.getTrackName, track);
               await cachedCall(host.getTrackVolume, track);
               await cachedCall(host.isTrackMute, track);
            }

            if (tracks.length > 0) {
               setReady(true);
            }
         }
      })();

      return () => {
         mounted = false;
      };
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

      return tracks;
   });

   return audioTracks;
}
