// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useState, useEffect, useRef } from '/lib/preact+htm.js';

let _hostReadCount = 0;
let _hostReadCountCB = [];
let _cacheDebugMessages = false;

export function useHostState(initial, hostCalls, target) {
   const hasSetter = Array.isArray(hostCalls) && hostCalls.length == 2;
   const getHostState = hasSetter ? hostCalls[0] : hostCalls;
   const setHostState = hasSetter ? hostCalls[1] : null;
   const cacheKey = djb2_hash(getHostState.toString() + target);
   const debugKey = cacheKey
      + (getHostState.name ? ` { ${getHostState.name}(${target}) }` : '');

   let cacheMiss = false;

   const [state, setState] = useState(() => {
      const stored = cacheRead(cacheKey, typeof initial);

      if (stored !== null) {
         cache_dbg(`H ${debugKey} = ${stored}`);
         return stored;
      }

      cache_dbg(`m ${debugKey}`);
      cacheMiss = true;

      return initial;
   });

   useEffect(() => {
      let mounted = true;

      if (cacheMiss) {
         (async () => {
            if (mounted) {
               setState(await getHostState(target));
               incHostReadCount();
            }
         })();
      }

      return () => {
         mounted = false;
      };
   }, [setState, getHostState]);

   useEffect(() => {
      let mounted = true;

      if (! compare(cacheRead(cacheKey, typeof state), state)) {
         if (state === null) {
            cache_dbg(`- ${debugKey}`);
         } else {
            cache_dbg(`+ ${debugKey} = ${state}`);
         }

         cacheWrite(cacheKey, state);

         if (setHostState) {
            (async () => {
               if (mounted) {
                  await setHostState(target, state);
               }
            })();
         }
      }

      return () => {
         mounted = false;
      };
   }, [state, setHostState, cacheKey]);

   return [state, setState];
}

export function useHostReadCountEffect(callback, deps) {
   useEffect(() => {
      _hostReadCountCB.push(callback);

      return () => {
         _hostReadCountCB = _hostReadCountCB.filter(cb => cb !== callback);
      };
   }, deps);
}

export function clearStateCache() {
   cache_dbg('clear');
   sessionStorage.clear();
}

export function enableCacheDebugMessages() {
   _cacheDebugMessages = true;
}

function incHostReadCount() {
   _hostReadCount++;
   _hostReadCountCB.forEach(cb => cb(_hostReadCount));
}

function cacheRead(key, type) {
   const value = sessionStorage.getItem(key);

   if (value === null) {
      return null;
   }

   if (type === 'string') {
      return value;
   }

   if (type === 'boolean') {
      return value === 'true';
   }

   if (type === 'number') {
      return Number(value);
   }

   if (type === 'object') {
      try {
         const parsed = JSON.parse(value);
         if (typeof parsed === type) {
            return parsed;
         }
      } catch {}
   }

   return null;
}

function cacheWrite(key, value) {
   if (value === null) {
      sessionStorage.removeItem(key);
      return;
   }

   if (typeof value === 'object') {
      try {
         sessionStorage.setItem(key, JSON.stringify(value));
      } catch {}
   } else {
      sessionStorage.setItem(key, String(value));
   }
}

function compare(a, b) {
   if (a === b) return true;

   if (a == null || b == null) return false;

   if (typeof a !== typeof b) return false;

   if (a instanceof Date && b instanceof Date) {
      return a.getTime() === b.getTime();
   }

   if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((item, index) => compare(item, b[index]));
   }

   if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);

      if (keysA.length !== keysB.length) return false;

      return keysA.every(key => 
         keysB.includes(key) && compare(a[key], b[key])
      );
   }

   return a === b;
}

function djb2_hash(str) {
   let hash = 5381;
   for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
   }
   return (hash >>> 0).toString(36);
}

function cache_dbg(message) {
   if (_cacheDebugMessages) {
      console.debug(`[cache]     ${message}`);
   }
}
