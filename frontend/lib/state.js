// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useState, useEffect, useRef } from '/lib/preact+htm.js';

let _cache_dbg = false;

export function useHostState(initial, hostCall, target = '') {
   const cacheKey = djb2_hash(hostCall.toString() + target);
   const readableKey = cacheKey
      + (hostCall.name ? ` { ${hostCall.name}(${target}) }` : '');

   let miss = false;

   const [state, setState] = useState(() => {
      const stored = cacheRead(cacheKey, typeof initial);

      if (stored !== null) {
         cache_dbg(`H ${readableKey} = ${stored}`);
         return stored;
      }

      miss = true;
      cache_dbg(`m ${readableKey}`);

      return initial;
   });

   useEffect(() => {
      if (! cacheWrite(cacheKey, state)) {
         return;
      }

      if (state === null) {
         cache_dbg(`- ${readableKey}`);
      } else {
         cache_dbg(`+ ${readableKey} = ${state}`);
      }
   }, [cacheKey, state]);

   useEffect(() => {
      let mounted = true;

      if (hostCall && miss) {
         (async () => {
            try {
               if (mounted) {
                  setState(await hostCall(target));
               }
            } catch (error) {
               cache_dbg(error);
            }
         })();
      }

      return () => {
         mounted = false;
      };
   }, []);

   return [state, setState];
}

export function clearStateCache() {
   sessionStorage.clear();
   cache_dbg('clear');
}

export function enableCacheDebugMessages() {
   _cache_dbg = true;
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
   if (compare(cacheRead(key, typeof value), value)) {
      return false;
   }

   if (value === null) {
      sessionStorage.removeItem(key);
      return true;
   }

   if (typeof value === 'object') {
      try {
         sessionStorage.setItem(key, JSON.stringify(value));
      } catch {
         return false;
      }
   } else {
      sessionStorage.setItem(key, String(value));
   }

   return true;
}

function djb2_hash(str) {
   let hash = 5381;
   for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
   }
   return (hash >>> 0).toString(36);
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

function cache_dbg(message) {
   if (_cache_dbg) {
      console.debug(`[cache]     ${message}`);
   }
}
