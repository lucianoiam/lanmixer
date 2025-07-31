// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

export * from '/vendor/preact.module.js';
export * from '/vendor/hooks.module.js';

import htm from '/vendor/htm.module.js';
import { createElement } from '/vendor/preact.module.js';
import { useEffect, useRef } from '/vendor/hooks.module.js';


export const H = htm.bind(createElement);

export function useUpdateEffect(callback, deps) {
   const isFirstRender = useRef(true);

   useEffect(() => {
      if (isFirstRender.current) {
         isFirstRender.current = false;
         return;
      }

      callback();
   }, deps);
}

export function useAsyncEffect(asyncFn, deps) {
   useAsyncEffectWithHook(asyncFn, deps, useEffect);
}

export function useUpdateAsyncEffect(asyncFn, deps) {
   useAsyncEffectWithHook(asyncFn, deps, useUpdateEffect);
}

function useAsyncEffectWithHook(asyncFn, deps, effectHook) {
   effectHook(() => {
      let isMounted = true;
      let cleanupFn = null;

      (async () => {
         if (isMounted) {
            const result = await asyncFn();
            if (isMounted && typeof result === 'function') {
               cleanupFn = result;
            }
         }
      })();

      return () => {
         isMounted = false;
         if (typeof cleanupFn === 'function') {
            cleanupFn();
         }
      };
   }, deps);
}
