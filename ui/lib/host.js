// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useCallback, useContext, useEffect, useState,
         createContext, createElement } from './react.js';
import { hasCacheKey, makeCacheKey, useCachedState } from './cache.js';

const { host } = dawscript;

const SessionContext = createContext();

export function SessionProvider({ children }) {
   const value = useSessionState();
   return createElement(SessionContext.Provider, { value }, children);
}

export function useSession() {
   return useContext(SessionContext);
}

// TODO: prompt user to reload when an exception occurs
export function useObjectProperty(init, handle, fn) {
   fn = typeof fn === 'function' ? { get: fn } : fn;
   return useObjectState(init, handle, fn)[0];
}

// TODO: prompt user to reload when an exception occurs
// If a setter is available, always call the getter on remount, since components
// may be updated by other clients or external events. Listeners are registered
// when the component mounts and are automatically cleaned up on unmount,
// ensuring state stays in sync and preventing memory leaks.
// fn: { get, set, addListener, removeListener }
export function useObjectState(init, handle, fn) {
   const key = makeCacheKey(fn.get, handle); 
   const [state, setState] = useCachedState(init, key);

   useAsyncEffect(async () => {
      try {
         if (typeof fn.addListener === 'function') {
            await fn.addListener(handle, setState);
         }

         if (! hasCacheKey(key) || typeof fn.set === 'function') {
            setState(await fn.get(handle));
         }
      } catch (err) {
         dbg_err(err);
      }

      return () => {
         if (typeof fn.removeListener === 'function') {
            fn.removeListener(handle, setState)
               .catch(dbg_err);
         }
      };
   }, [key.hash]);

   const setStateAndCallSetFn = useCallback(async (newState) => {
      setState(newState);
      await fn.set(handle, newState);
   }, [key.hash]);

   return [state, setStateAndCallSetFn];
}

function useSessionState() {
   const [state, setState] = useState({
      id: 0,
      isOnline: false,
      faderLabels: null
   });

   useEffect(() => {
      let id = 0;

      dawscript.connect((isOnline) => {
         setState((prev) => ({ ...prev, isOnline }));

         if (isOnline) {
            id++;
            setState((prev) => ({ ...prev, id }));

            (async () => {
               try {
                  const globals = await fetchSessionGlobals();
                  setState((prev) => ({ ...prev, ...globals }));
               } catch (err) {
                  // TODO: prompt user to reload when an exception occurs
                  dbg_err(err);
               }
            })();
         }

         return true;
      });
   }, []);

   return state;
}

async function fetchSessionGlobals() {
   return {
      faderLabels: await host.getFaderLabels()
   }; 
}

function dbg_err(message) {
   console.error(`[state]     ${message}`);
}
