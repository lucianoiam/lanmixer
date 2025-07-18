// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useEffect, useRef } from '/lib/preact+htm.js';
import { hasCachedState, useCachedState } from '/lib/cache.js';


let _hostReadCount = 0;
let _hostReadCountCB = [];

export function useHostCall(initial, call, target) {
   return useHostCallRO(initial, call, target)[0];
}

export function useHostState(initial, calls, target) {
   return useHostCallRW(initial, calls[0], calls[1], target);
}

function useHostCallRO(initial, getter, target) {
   const [state, setState] = useCachedState(initial, getter, target);
   const cacheMiss = ! hasCachedState(getter, target);

   useEffect(() => {
      let mounted = true;

      if (cacheMiss) {
         (async () => {
            if (mounted) {
               setState(await getter(target));

               _hostReadCount++;
               _hostReadCountCB.forEach(cb => cb(_hostReadCount));
            }
         })();
      }

      return () => {
         mounted = false;
      };
   }, [getter, setState]);

   return [state, setState];
}

function useHostCallRW(initial, getter, setter, target) {
   const [state, setState] = useHostCallRO(initial, getter, target);
   const hasInitialRender = useRef(false);

   useEffect(() => {
      let mounted = true;

      if (setter) {
         (async () => {
            if (mounted) {
               if (hasInitialRender.current) {
                  await setter(target, state);
               }

               hasInitialRender.current = true;
            }
         })();
      }

      return () => {
         mounted = false;
      };
   }, [setter, state]);

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
