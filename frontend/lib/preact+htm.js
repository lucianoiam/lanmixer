// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

export * from '/vendor/preact.module.js';
export * from '/vendor/hooks.module.js';

import htm from '/vendor/htm.module.js';
import { createElement } from '/vendor/preact.module.js';
import { useEffect } from '/vendor/hooks.module.js';

export const h = htm.bind(createElement);

export function useAsyncEffect(asyncFn, deps) {
   useEffect(() => {
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
