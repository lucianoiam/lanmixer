// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useCallback, useEffect, useRef, useState, useContext,
         createContext, createElement as elem }
   from '/lib/react.js';
import { buildCacheKey, hasCacheKey, clearCache, callWithCache, useCachedState } 
   from '/lib/cache.js';

const { host, TrackType } = dawscript;

const ConnectionContext = createContext();
const g = { dirtyState: new Set() };

// Always check track handles and types on startup
invalidateAudioTracks();


export function ConnectionProvider({ children }) {
   const [state, setState] = useState({ isOnline: false, sessionId: 0 });

   useEffect(() => {
      let sessionId = 0;

      dawscript.connect((isOnline) => {
         if (isOnline) {
            sessionId++;

            if (sessionId > 1) { // automatic reconnection?
               clearCache(); // full refresh
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

   useAsyncEffect(async () => {
      try {
         const tracks = await getAudioTracks();
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
   }, [sessionId]);

   return isReady;
}

export function useAudioTracks() {
   const { sessionId } = useContext(ConnectionContext);
   return useCachedFnCall([], getAudioTracks, null, [sessionId])[0];
}

export function useImmutableState(init, target, getFn) {
   return useCachedFnCall(init, getFn, target)[0];
}

export function useMutableState(init, target, getFn, setFn, addListenerFn,
      removeListenerFn) {
   const [state, setState] = useCachedFnCall(init, getFn, target);
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

function useCachedFnCall(init, fn, arg) {
   const key = buildCacheKey(fn, arg); 
   const [state, setState] = useCachedState(init, key);

   useAsyncEffect(async () => {
      if (hasCacheKey(key)) {
         if (! g.dirtyState.has(key.hash)) {
            return;
         }
         
         g.dirtyState.delete(key.hash);
      }

      try {
         setState(await fn(arg));
      } catch (err) {
         dbg_err(err);
      }
   });

   return [state, setState];
}

function invalidateAudioTracks() {
   g.dirtyState.add(buildCacheKey(getAudioTracks).hash);
}

async function getAudioTracks() {
   const tracks = [];

   for (const track of await host.getTracks()) {
      if (await host.getTrackType(track) == TrackType.AUDIO) {
         tracks.push(track);
      }
   }

   return tracks;
}

function dbg(message) {
   console.debug(`[state]     ${message}`);
}

function dbg_err(message) {
   console.error(`[state]     ${message}`);
}
