// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { callAndWriteResult as call, readCallResult as read } from './cache.js';
import { host, TrackType } from './dawscript.js';
import { useObjectField } from './state-host.js';
import { useAsyncEffect, useState } from './react.js';


export function useAudioTracks() {
   const handles = useObjectField(null, null, host.getTracks);
   const [state, setState] = useState(() => handles !== null
      ? hydrateTracks(handles).filter(t => t.type === TrackType.AUDIO)
      : null
   );

   useAsyncEffect(async () => {
      if (handles === null) return;
      const types = await Promise.all(handles.map(handle =>
         call(host.getTrackType, handle)
      ));
      const audHnd = handles.filter((_, i) => types[i] === TrackType.AUDIO);
      setState(await fetchTracks(audHnd));
   }, [handles]);

   return state;
}

export function useTrackPlugins(track) {
   const [state, setState] = useState(() =>
      hydratePlugins(track.pluginHandles)
   );

   useAsyncEffect(async () => {
      const hydrated = hydratePlugins(track.pluginHandles);
      setState(hydrated);
      if (hydrated === null) {
         setState(await fetchPlugins(track.pluginHandles));
      }
   }, [track]);

   return state;
}

function hydrateTracks(handles) {
   return allOrNull(handles.map(handle => ({
      handle,
      type: read(host.getTrackType, handle),
      name: read(host.getTrackName, handle),
      volume: read(host.getTrackVolume, handle),
      pan: read(host.getTrackPan, handle),
      isMuted: read(host.isTrackMute, handle),
      pluginHandles: read(host.getTrackPlugins, handle)
   })));
}

async function fetchTracks(handles) {
   return Promise.all(handles.map(async handle => {
      const r = await Promise.all([
         call(host.getTrackType, handle),
         call(host.getTrackName, handle),
         call(host.getTrackVolume, handle),
         call(host.getTrackPan, handle),
         call(host.isTrackMute, handle),
         call(host.getTrackPlugins, handle)
      ]);
      return {
         handle,
         type: r[0],
         name: r[1],
         volume: r[2],
         pan: r[3],
         isMuted: r[4],
         pluginHandles: r[5]
      };
   }));
}

function hydratePlugins(handles) {
   return allOrNull(handles.map(handle => ({
      handle,
      name: read(host.getPluginName, handle),
      isEnabled: read(host.isPluginEnabled, handle),
      params: hydrateParameters(read(host.getPluginParameters, handle) ?? [])
   })));
}

async function fetchPlugins(handles) {
   return Promise.all(handles.map(async handle => {
      const r = await Promise.all([
         call(host.getPluginName, handle),
         call(host.isPluginEnabled, handle),
         call(host.getPluginParameters, handle)
      ]);
      return {
         handle,
         name: r[0],
         isEnabled: r[1],
         params: await fetchParameters(r[2])
      };
   }));
}

function hydrateParameters(handles) {
   return allOrNull(handles.map(handle => ({
      handle,
      name: read(host.getParameterName, handle),
      value: read(host.getParameterValue, handle),
      displayValue: read(host.getParameterDisplayValue, handle)
   })));
}

async function fetchParameters(handles) {
   return Promise.all(handles.map(async handle => {
      const r = await Promise.all([
         call(host.getParameterName, handle),
         call(host.getParameterValue, handle),
         call(host.getParameterDisplayValue, handle)
      ]);
      return {
         handle,
         name: r[0],
         value: r[1],
         displayValue: r[2]
      };
   }));
}

function allOrNull(arr) {
   return arr.every(o =>
      Object.values(o).every(v => v !== null)
   ) ? arr : null;
}
