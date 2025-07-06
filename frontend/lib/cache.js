// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useState, useEffect, useRef } from '/lib/preact+htm.js';

export function useEffectIfCacheEmpty(key, effect, deps = []) {
   useEffect(() => {
      const hashedKey = djb2_hash(key);
      if (sessionStorage.getItem(hashedKey) === null) {
         return effect();
      }
   }, deps);
}

export function useStateWithCache(key, initialValue) {
   const hashedKey = djb2_hash(key);
   const skipInitialWrite = useRef(true);

   const [state, setState] = useState(() => {
      const storedValue = sessionStorage.getItem(hashedKey);
      if (storedValue === null) return initialValue;

      const type = typeof initialValue;

      console.debug(`[cache] R ${key} [${hashedKey}] = ${storedValue}`);

      if (type === 'number') {
         const parsed = Number(storedValue);
         return isNaN(parsed) ? initialValue : parsed;
      }

      if (type === 'boolean') {
         return storedValue === 'true';
      }

      if (type === 'string') {
         return storedValue;
      }

      try {
         const parsed = JSON.parse(storedValue);
         return Array.isArray(initialValue) || (type === 'object' && initialValue !== null)
            ? parsed
            : initialValue;
      } catch {
         return initialValue;
      }
   });

   useEffect(() => {
      if (skipInitialWrite.current) {
         skipInitialWrite.current = false;
         return;
      }

      if (state === null) {
         console.debug(`[cache] - ${key}`);
         sessionStorage.removeItem(hashedKey);
      } else {
         console.debug(`[cache] + ${key} [${hashedKey}] = ${state}`);
         const type = typeof initialValue;

         if (
            Array.isArray(initialValue) ||
            (type === 'object' && initialValue !== null)
         ) {
            try {
               sessionStorage.setItem(hashedKey, JSON.stringify(state));
            } catch {
               // Ignore errors (e.g. circular references)
            }
         } else {
            sessionStorage.setItem(hashedKey, String(state));
         }
      }
   }, [hashedKey, state]);

   return [state, setState];
}

function djb2_hash(str) {
   let hash = 5381;
   for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
   }
   return (hash >>> 0).toString(36);
}
