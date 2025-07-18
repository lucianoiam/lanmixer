// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useEffect, useRef } from '/lib/preact+htm.js';
import { buildStateCacheKey, stateCacheHasKey, useCachedState }
   from '/lib/cache.js';

let _hostReadCount = 0;
let _hostReadCountCB = [];

export function useHostState(initial, hostCalls, target) {
   const hasSetter = Array.isArray(hostCalls) && hostCalls.length == 2;
   const getHostState = hasSetter ? hostCalls[0] : hostCalls;
   const setHostState = hasSetter ? hostCalls[1] : null;
   const cacheKey = buildStateCacheKey(getHostState, target);
   const cacheMiss = ! stateCacheHasKey(cacheKey);

   const [state, setState] = useCachedState(initial, getHostState, target);
   const hasInitialRender = useRef(false);

   useEffect(() => {
      let mounted = true;

      if (cacheMiss) {
         (async () => {
            if (mounted) {
               setState(await getHostState(target));

               _hostReadCount++;
               _hostReadCountCB.forEach(cb => cb(_hostReadCount));
            }
         })();
      }

      return () => {
         mounted = false;
      };
   }, [setState, getHostState]);

   useEffect(() => {
      let mounted = true;

      if (setHostState) {
         (async () => {
            if (mounted) {
               if (hasInitialRender.current) {
                  await setHostState(target, state);
               }

               hasInitialRender.current = true;
            }
         })();
      }

      return () => {
         mounted = false;
      };
   }, [state, setState, setHostState]);

   return [state, setState];
}

export function useHostReadCountEffect(callback, deps) {
   useEffect(() => {
      _hostReadCountCB.push(callback);

      return () => {
         _hostReadCountCB = _hostReadCountCB.filter(cb => cb !== callback);
      };
   }, [callback, ...deps]);
}
