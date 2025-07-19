// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useEffect, useRef, useState } from '/lib/preact+htm.js';
import { clearStateCache, useCachedState } from '/lib/cache.js';

const { host, TrackType } = dawscript


export function useHostConnect() {
   const [isOnline, setOnline] = useState(false);

   useEffect(() => {
      dawscript.connect((status) => {
         setOnline(status);

         if (! status) {
            clearStateCache();
         }

         return true;
      });
   }, [setOnline]);

   return isOnline;
}

export function useInitStateIsReady(callCountPollMs = 10, readyWaitMs = 100) {
   const [isReady, setReady] = useState(false);
   const [callCount, setCallCount] = useState(dawscript.getCallCount());
   const shouldCountCalls = useRef(true);
   const readyWaitTimer = useRef(null);

   const stopCount = () => shouldCountCalls.current = false;

   const runCount = () => {
      setCallCount(dawscript.getCallCount());

      if (shouldCountCalls.current) {
         setTimeout(runCount, callCountPollMs);
      }
   };

   useEffect(() => {
      runCount();
      return stop;
   }, []);
   
   useEffect(() => {
      clearTimeout(readyWaitTimer.current);

      readyWaitTimer.current = setTimeout(() => {
         stopCount();
         setReady(true);
      }, readyWaitMs);
   }, [callCount]);

   return isReady;
}

export function useAudioTracks() {
   const audioTracks = useHostCall([], async () => {
      const tracks = [];

      for (const track of await host.getTracks()) {
         const type = await host.getTrackType(track);

         if (type == TrackType.AUDIO) {
            tracks.push(track);
         }
      }

      return tracks;
   });

   return audioTracks;
}

export function useHostState(initial, getFunc, setFunc, addListenerFunc,
      removeListenerFunc, target) {
   const [state, setState, setStateLocalOnly] = useHostCallRW(initial, getFunc,
      setFunc, target);

   useEffect(() => {
      let mounted = true;

      (async () => {
         if (mounted) {
            await addListenerFunc(target, setStateLocalOnly);
         }
      })();

      return () => {
         let mounted = false;
         removeListenerFunc(target, setStateLocalOnly);
      };
   }, []);

   return [state, setState];
}

export function useHostCall(initial, func, target) {
   return useHostCallRO(initial, func, target)[0];
}

function useHostCallRO(initial, getFunc, target) {
   const [state, setState] = useCachedState(initial, getFunc, target);

   useEffect(() => {
      let mounted = true;

      (async () => {
         if (mounted) {
            setState(await getFunc(target));
         }
      })();

      return () => {
         mounted = false;
      };
   }, []);

   return [state, setState];
}

function useHostCallRW(initial, getFunc, setFunc, target) {
   const [state, setState] = useHostCallRO(initial, getFunc, target);
   const skipNextCall = useRef(true); // skip first

   const setStateLocalOnly = (value) => {
      skipNextCall.current = true;
      setState(value);
   };

   useEffect(() => {
      let mounted = true;

      (async () => {
         if (mounted) {
            if (skipNextCall.current) {
               skipNextCall.current = false;
               return;
            }

            await setFunc(target, state);
         }
      })();

      return () => {
         mounted = false;
      };
   }, [setFunc, state]);

   return [state, setState, setStateLocalOnly];
}
