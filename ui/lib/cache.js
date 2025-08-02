// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useCallback, useEffect, useMemo, useState } from './react.js';

let _storage = {};
let _debugMessages = false;

export function enableCacheDebugMessages() {
   _debugMessages = true;
}

export function readCallResult(fn, arg) {
   return read(makeCacheKey(fn, arg));
}

export async function callAndWriteResult(fn, arg) {
   const value = await fn(arg)
   write(makeCacheKey(fn, arg), value);
   return value;
}

export function makeCacheKey(fn, arg) {
   return { fn, arg, hash: djb2_hash(fn.toString() + (arg ?? '').toString()) };
}

export function hasCacheKey(key) {
   return key.hash in _storage;
}

export function useCachedState(init, key) {
   const initialValue = useMemo(() => {
      return typeof init === 'function' ? init() : init;
   }, [init]);

   const readOrInitValue = () => read(key, typeof initialValue) ?? initialValue;

   const [value, setValue] = useState(readOrInitValue);
   
   useEffect(() => {
      setValue(readOrInitValue());
   }, [key.hash]);

   const setValueAndWrite = useCallback((newValue) => {
      setValue(newValue);
      write(key, newValue);
   }, [key.hash]);

   return [value, setValueAndWrite];
}

function formatKey(key) {
   if (! key.fn.name) {
      return '';
   }

   const args = key.arg ? `( ${key.arg} }` : '()';

   return `, ${key.fn.name}${args}`;
}

function read(key) {
   const value = key.hash in _storage ? _storage[key.hash] : null;

   if (value !== null) {
      dbg(`● ${key.hash} = ${value} ${formatKey(key)}`);
   } else {
      dbg(`○ ${key.hash} ${formatKey(key)}`);
   }

   return value;
}

function write(key, value) {
   if (key.hash in _storage) {
      dbg(`⨁ ${key.hash} = ${value} ${formatKey(key)}`);
   } else {
      dbg(`+ ${key.hash} = ${value} ${formatKey(key)}`);
   }

   _storage[key.hash] = value;
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
