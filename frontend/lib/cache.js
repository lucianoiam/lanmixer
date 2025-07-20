// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useEffect, useRef, useState } from '/lib/react.js';

let _debugMessages = false;


export function enableCacheDebugMessages() {
   _debugMessages = true;
}

export function clearCache() {
   dbg('clear');
   sessionStorage.clear();
}

export function buildCacheKey(call, target) {
   return {
      call,
      target,
      hash: djb2_hash(call.toString() + (target ?? '').toString())
   };
}

export function hasCacheKey(key) {
   return key.hash in sessionStorage;
}

export async function cachedCall(call, target, type = 'string') {
   const ckey = buildCacheKey(call, target);

   if (hasCacheKey(ckey)) {
      return read(ckey, type);
   }

   const value = await call(target)
   write(ckey, value);

   return value;
}

export function useCachedState(init, key, deps = []) {
   const isFirstRender = useRef(true);
   const cachedState = isFirstRender.current ? read(key, typeof init) : null;
   const [value, setValue] = useState(cachedState ?? init);

   useEffect(() => {
      if (isFirstRender.current) {
         isFirstRender.current = false;
         return;
      }

      write(key, value);  
   }, [value, ...deps]);

   return [value, setValue];
}

function read(key, type = 'string') {
   const rawValue = sessionStorage.getItem(key.hash);

   let value = null;

   if (rawValue === null) {
      dbg(`○ ${key.hash} ${formatKey(key)}`);
   } else {
      dbg(`● ${key.hash} = ${rawValue} ${formatKey(key)}`);

      if (type === 'string') {
         value = rawValue;

      } else if (type === 'boolean') {
         value = rawValue === 'true';

      } else if (type === 'number') {
         value = Number(rawValue);

      } else if (type === 'object') {
         const parsed = JSON.parse(rawValue);
         if (typeof parsed === type) {
            value = parsed;
         }
      }
   }

   return value;
}

function write(key, value) {
   const rawValue = typeof value === 'object'
      ? JSON.stringify(value)
      : String(value);

   if (key.hash in sessionStorage) {
      dbg(`⨁ ${key.hash} = ${rawValue} ${formatKey(key)}`);
   } else {
      dbg(`+ ${key.hash} = ${rawValue} ${formatKey(key)}`);
   }

   sessionStorage.setItem(key.hash, rawValue);
}

function formatKey(key) {
   if (! key.call.name) {
      return '';
   }

   const args = key.target ? `( ${key.target} }` : '()';

   return `, ${key.call.name}${args}`;
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
