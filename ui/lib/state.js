// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useCallback, useEffect, useState, useContext,
         createContext, createElement }
   from './react.js';
import { makeCacheKey, hasCacheKey, getCachedCallResult, callAndCacheResult,
         useCachedState, } 
   from './cache.js';

const { host, TrackType } = dawscript;

const SessionContext = createContext();


export function SessionProvider({ children }) {
   const value = useSessionState();
   return createElement(SessionContext.Provider, { value }, children);
}

export function useSession() {
   return useContext(SessionContext);
}

export function usePluginDetails(plugin) {
   const name = useImmutableState(null, plugin, host.getPluginName);
   const isEnabled = useImmutableState(null, plugin, host.isPluginEnabled);

   return ((name !== null) && (isEnabled !== null))
      ? { name, isEnabled }
      : null;
}

export function usePluginAndParameterDetails(plugin) {
   const details = usePluginDetails(plugin);
   const paramHandles = useImmutableState(null, plugin, host.getPluginParameters);

   const getCachedParameterDetails = (params) => params
      .map(param => ({
         handle: param,
         name: getCachedCallResult(host.getParameterName, param),
         value: getCachedCallResult(host.getParameterValue, param),
         displayValue: getCachedCallResult(host.getParameterDisplayValue, param)
      }))
      .map(param => Object.values(param)
      .includes(null) ? null : param);
   
   const [params, setParams] = useState(() =>
      paramHandles !== null ? getCachedParameterDetails(paramHandles) : null
   );

   useAsyncEffect(async () => {
      if (paramHandles !== null) {
         await Promise.all(paramHandles.flatMap(param => [
            callAndCacheResult(host.getParameterName, param),
            callAndCacheResult(host.getParameterValue, param),
            callAndCacheResult(host.getParameterDisplayValue, param)
         ]));
         setParams(getCachedParameterDetails(paramHandles));
      }
   }, [paramHandles]);

   return (details !== null) && (params !== null)
      ? { ...details, params }
      : null;
}

// TODO: prompt user to reload when an exception occurs
export function useImmutableState(init, target, fn) {
   fn = typeof fn === 'function' ? { get: fn } : fn;
   return useMutableState(init, target, fn)[0];
}

// TODO: prompt user to reload when an exception occurs
// If a setter is available, always call the getter on remount, since components
// may be updated by other clients or external events. Listeners are registered
// when the component mounts and are automatically cleaned up on unmount,
// ensuring state stays in sync and preventing memory leaks.
// fn: { get, set, addListener, removeListener }
export function useMutableState(init, target, fn) {
   const key = makeCacheKey(fn.get, target); 
   const [state, setState] = useCachedState(init, key);

   useAsyncEffect(async () => {
      try {
         if (typeof fn.addListener === 'function') {
            await fn.addListener(target, setState);
         }

         if (! hasCacheKey(key) || typeof fn.set === 'function') {
            setState(await fn.get(target));
         }
      } catch (err) {
         dbg_err(err);
      }

      return () => {
         if (typeof fn.removeListener === 'function') {
            fn.removeListener(target, setState)
               .catch(dbg_err);
         }
      };
   }, [key.hash]);

   const setStateAndCallSetFn = useCallback(async (newState) => {
      setState(newState);
      await fn.set(target, newState);
   }, [key.hash]);

   return [state, setStateAndCallSetFn];
}

function useSessionState() {
   const [state, setState] = useState({
      id: 0,
      isOnline: false,
      mixer: {
         audioTracks: [],
         faderLabels: [],
         hasDetails: false
      }
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
                  const mixer = await getMixerLayout();
                  await precacheTracks(mixer.audioTracks);
                  mixer.hasDetails = true;
                  setState((prev) => ({ ...prev, mixer }));
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

async function getMixerLayout() {
   const [audioTracks, faderLabels] = await Promise.all([
      host.getTracks().then(tracks =>
         Promise.all(tracks.map(async track => ({
            track,
            type: await host.getTrackType(track),
         })))
         .then(typed =>
            typed
               .filter(({ type }) => type === TrackType.AUDIO)
               .map(({ track }) => track)
         )
      ),
      host.getFaderLabels(),
   ]);

   return { audioTracks, faderLabels };
}

async function precacheTracks(tracks) {
   await Promise.all(
      tracks.flatMap(track => [
         callAndCacheResult(host.getTrackName, track),
         callAndCacheResult(host.getTrackVolume, track),
         callAndCacheResult(host.getTrackPan, track),
         callAndCacheResult(host.isTrackMute, track),
         callAndCacheResult(host.getTrackPlugins, track)
      ])
   );
}

function dbg_err(message) {
   console.error(`[state]     ${message}`);
}
