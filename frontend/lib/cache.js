// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

let _debugMessages = false;

export function enableCacheDebugMessages() {
   _debugMessages = true;
}

export function clearCache() {
   dbg('clear');
   sessionStorage.clear();
}

export function hasCacheKey(call, target) {
   return contains({ call, target });
}

export function removeCacheKey(call, target) {
   remove({ call, target })
}

export function getCacheValue(call, target, returnType = 'string') {
   return read({ call, target }, returnType);
}

export function setCacheValue(call, target, value) {
   write({ call, target }, value);
}

export async function cachedCall(call, target, returnType = 'string') {
   const key = { call, target };

   if (contains(key)) {
      return read(key, returnType);
   }

   const value = await call(target)
   write(key, value);

   return value;
}

function contains(key) {
   return hashKey(key) in sessionStorage;
}

function remove(key) {
   const hkey = hashKey(key);
   const dkey = debugKey(key);

   dbg(`- ${hkey} ${dkey}`);
   sessionStorage.removeItem(hkey);
}

function read(key, type) {
   const hkey = hashKey(key);
   const dkey = debugKey(key);
   const rawValue = sessionStorage.getItem(hkey);

   let value = null;

   if (rawValue === null) {
      dbg(`○ ${hkey} ${dkey}`);
   } else {
      dbg(`● ${hkey} = ${rawValue} ${dkey}`);

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
   const hkey = hashKey(key);
   const dkey = debugKey(key);
   const rawValue = typeof value === 'object'
      ? JSON.stringify(value)
      : String(value);

   if (hkey in sessionStorage) {
      dbg(`⨁ ${hkey} = ${rawValue} ${dkey}`);
   } else {
      dbg(`+ ${hkey} = ${rawValue} ${dkey}`);
   }

   sessionStorage.setItem(hkey, rawValue);
}

function hashKey(key) {
   return djb2_hash(key.call.toString() + key.target);
}

function debugKey(key) {
   if (! key.call.name) {
      return '';
   }

   return `   { ${key.call.name}(${key.target ?? ''}) }`;
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
