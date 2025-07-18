// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useEffect, useRef } from '/lib/preact+htm.js';
import { hasCachedState, useCachedState } from '/lib/cache.js';


let _hostStateReadCount = 0;
let _hostStateReadCountCB = [];

export function useHostStateReadCountEffect(callback, deps) {
   useEffect(() => {
      _hostStateReadCountCB.push(callback);

      return () => {
         _hostStateReadCountCB = _hostStateReadCountCB.filter((cb) => {
            return cb !== callback;
         });
      };
   }, [callback, ...deps]);
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

            _hostStateReadCount++;
            _hostStateReadCountCB.forEach(cb => cb(_hostStateReadCount));
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
