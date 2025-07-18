// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useEffect, useRef } from '/lib/preact+htm.js';
import { hasCachedState, useCachedState } from '/lib/cache.js';


let _hostInitStateCount = 0;
let _hostInitStateCountCB = [];

export function useHostInitStateCountEffect(callback, deps) {
   useEffect(() => {
      _hostInitStateCountCB.push(callback);

      return () => {
         _hostInitStateCountCB = _hostInitStateCountCB.filter(cb => cb !== callback);
      };
   }, [callback, ...deps]);
}

export function useHostCall(initial, func, target) {
   return useHostCallRO(initial, func, target)[0];
}

export function useHostState(initial, getFunc, setFunc, addListenerFunc,
      removeListenerFunc, target) {
   const [state, setState, setLocalState] = useHostCallRW(initial, getFunc,
      setFunc, target);

   useEffect(() => {
      let mounted = true;

      (async () => {
         if (mounted) {
            await addListenerFunc(target, setLocalState);
         }
      })();

      return () => {
         let mounted = false;
         removeListenerFunc(target, setLocalState);
      };
   }, []);

   return [state, setState];
}

function useHostCallRO(initial, getFunc, target) {
   const [state, setState] = useCachedState(initial, getFunc, target);

   useEffect(() => {
      let mounted = true;

      (async () => {
         if (mounted) {
            setState(await getFunc(target));

            _hostInitStateCount++;
            _hostInitStateCountCB.forEach(cb => cb(_hostInitStateCount));
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
   const skipNextCall = useRef(true);

   const setLocalState = (value) => {
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

   return [state, setState, setLocalState];
}
