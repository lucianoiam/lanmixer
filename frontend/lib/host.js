// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useCallback, useEffect, useRef, useState, useContext,
         createContext, createElement as elem }
   from '/lib/react.js';
import { buildCacheKey, hasCacheKey, removeCacheKey, clearCache, callWithCache,
         useCachedState } 
   from '/lib/cache.js';

const { host, TrackType } = dawscript;

const ConnectionContext = createContext();
const g = { dirtyState: new Set() };


export function ConnectionProvider({ children }) {
   const [state, setState] = useState({ isOnline: false, sessionId: 0 });

   useEffect(() => {
      let sessionId = 0;
      let isUserReload = false;

      // Refresh track list (handles and types) on  ⌘R, F5, etc.
      window.addEventListener('beforeunload', () => {
         removeCacheKey(buildCacheKey(hostGetTracksOfTypeAudio));
         isUserReload = true;
      });

      dawscript.connect((isOnline) => {
         if (isOnline) {
            sessionId++;

            // Keep cached state, except track list as commented above.
            // Do not try to reconnect.
            if (isUserReload) {
               return false;
            }

            // Full refresh after automatic reconnection
            if (sessionId > 1) {
               clearCache();
            }
         }

         setState({ isOnline, sessionId });

         return true;
      });
   }, []);

   return elem(ConnectionContext.Provider, { value: state }, children);
}

export function useConnected() {
   const dsState = useContext(ConnectionContext);

   if (dsState === undefined) {
      throw new Error('useConnected must be used within a ConnectionProvider');
   }

   return dsState.isOnline;
}

export function useMixerReady() {
   const [isReady, setReady] = useState(false);
   const { sessionId } = useContext(ConnectionContext);
   const tracks = useAudioTracks();

   useAsyncEffect(async () => {
      try {
         if (tracks.length > 0) {
            for (const track of tracks) {
               await callWithCache(host.getTrackName, track);
               await callWithCache(host.getTrackVolume, track);
               await callWithCache(host.isTrackMute, track);
            }

            setReady(true);
         }
      } catch (err) {
         dbg_err(err);
      }
   }, [sessionId, tracks]);

   return isReady;
}

export function useAudioTracks() {
   const { sessionId } = useContext(ConnectionContext);
   return useGetFnCall([], hostGetTracksOfTypeAudio, null, [sessionId])[0];
}

export function useImmutableState(init, target, getFn, deps) {
   return useGetFnCall(init, getFn, target, deps)[0];
}

export function useMutableState(init, target, getFn, setFn, addListenerFn,
      removeListenerFn, deps) {
   const [state, setState] = useGetFnCall(init, getFn, target, deps);
   const skipNextSetFnCall = useRef(true); // do not send init state

   const listener = useCallback((newState) => {
      skipNextSetFnCall.current = true;
      setState(newState);
   }, []);

   useAsyncEffect(async () => {
      try {
         await addListenerFn(target, listener);
      } catch (err) {
         dbg_err(err);
      }

      return () => {
         removeListenerFn(target, listener).catch(dbg_err);
         const key = buildCacheKey(getFn, target);
         g.dirtyState.add(key.hash); // force getFn call on next mount
      };
   }, []);

   useAsyncEffect(async () => {
      if (skipNextSetFnCall.current) {
         skipNextSetFnCall.current = false;
         return;
      }

      try {
         await setFn(target, state);
      } catch (err) {
         dbg_err(err);
      }
   }, [state]);

   return [state, setState];
}

function useGetFnCall(init, fn, arg, deps) {
   const key = buildCacheKey(fn, arg); 
   const [state, setState] = useCachedState(init, key);

   useAsyncEffect(async () => {
      if (hasCacheKey(key) && ! g.dirtyState.has(key.hash)) {
         return;
      }

      g.dirtyState.delete(key.hash);

      try {
         const result = await fn(arg);

         // FIXME - dawscript bug: workaround for the asymmetry between the
         // volume getter and setter values caused by the conversion curves.
         // set_track_volume( vol_db ); get_track_volume() == vol_db ± err
         if ((fn.name == 'getTrackVolume')
               && (Math.abs(state - result) < 2/*dB*/)) {
            return;
         }

         setState(result);
      } catch (err) {
         dbg_err(err);
      }
   }, deps);

   return [state, setState];
}

async function hostGetTracksOfTypeAudio() {
   const tracks = [];

   for (const track of await host.getTracks()) {
      if (await host.getTrackType(track) == TrackType.AUDIO) {
         tracks.push(track);
      }
   }

   return tracks;
}

function dbg_err(message) {
   console.error(`[state]     ${message}`);
}
