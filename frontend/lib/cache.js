// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useEffect, useState } from '/lib/preact+htm.js';

let _debugMessages = false;

export function enableStateCacheDebugMessages() {
   _debugMessages = true;
}

export function clearStateCache() {
   dbg('clear');
   sessionStorage.clear();
}

export function buildStateCacheKey(call, target) {
   return djb2_hash(call.toString() + target);
}

export function stateCacheHasKey(key) {
   return key in sessionStorage;
}

export function useCachedState(initial, call, target) {
   const key = buildStateCacheKey(call, target);
   const debugKey = key + (call.name ? ` { ${call.name}(${target}) }` : '');

   const [state, setState] = useState(() => {
      const stored = read(key, typeof initial);

      if (stored === null) {
         dbg(`m ${debugKey}`);
      } else {
         dbg(`H ${debugKey} = ${stored}`);
      }

      return stored ?? initial;
   });

   useEffect(() => {
      if (! compare(read(key, typeof state), state)) {
         if (state === null) {
            dbg(`- ${debugKey}`);
         } else {
            dbg(`+ ${debugKey} = ${state}`);
         }

         write(key, state);
      }
   }, [key, state]);

   return [state, setState];
}

function read(key, type) {
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
      const parsed = JSON.parse(value);
      if (typeof parsed === type) {
         return parsed;
      }
   }

   return null;
}

function write(key, value) {
   if (value === null) {
      sessionStorage.removeItem(key);
      return;
   }

   if (typeof value === 'object') {
      sessionStorage.setItem(key, JSON.stringify(value));
      return;
   }

   sessionStorage.setItem(key, String(value));
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

function dbg(message) {
   if (_debugMessages) {
      console.debug(`[cache]     ${message}`);
   }
}
