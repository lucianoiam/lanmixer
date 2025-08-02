// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useState } from './react.js';
import { callAndWriteResult, readCallResult } from './cache.js';
import { useObjectProperty } from './host.js';

const { host, TrackType } = dawscript;

export function useAudioTracks() {
   const handles = useObjectProperty(null, null, host.getTracks);
   const [tracks, setTracks] = useState(() => handles !== null
      ? readTrackDetails(handles).filter(t => t.type === TrackType.AUDIO)
      : null
   );

   useAsyncEffect(async () => {
      if (handles !== null) {
         const types = await fetchTrackTypes(handles);
         const audHnd = handles.filter((_, i) => types[i] === TrackType.AUDIO);
         setTracks(await fetchTrackDetails(audHnd));
      }
   }, [handles]);

   return tracks;
}

export function usePluginNames(handles) {
   const [names, setNames] = useState(() =>
      handles.map(handle => readCallResult(host.getPluginName, handle))
   );

   useAsyncEffect(async () => {
      setNames(await Promise.all(handles.map(handle =>
         callAndWriteResult(host.getPluginName, handle)
      )));
   }, []);

   return names;
}

export function usePlugin(handle) {
   const name = useObjectProperty(null, handle, host.getPluginName);
   const isEnabled = useObjectProperty(null, handle, host.isPluginEnabled);
   const paramHnd = useObjectProperty(null, handle, host.getPluginParameters);
   const [params, setParams] = useState(() => paramHnd !== null
      ? readParameterDetails(paramHnd)
      : null
   );

   useAsyncEffect(async () => {
      if (paramHnd !== null) {
         setParams(await fetchParameterDetails(paramHnd));
      }
   }, [paramHnd]);

   return (name !== null) && (isEnabled !== null) && (params !== null)
      ? { handle, name, isEnabled, params }
      : null;
}

function readTrackDetails(handles) {
   return handles.map(handle => ({
      handle,
      type: readCallResult(host.getTrackType, handle),
      name: readCallResult(host.getTrackName, handle),
      volume: readCallResult(host.getTrackVolume, handle),
      pan: readCallResult(host.getTrackPan, handle),
      isMuted: readCallResult(host.isTrackMute, handle),
      pluginHandles: readCallResult(host.getTrackPlugins, handle)
   }))
      .filter(track => Object.values(track).every(prop => prop !== null));
}

function readParameterDetails(handles) {
   return handles.map(handle => ({
      handle,
      name: readCallResult(host.getParameterName, handle),
      value: readCallResult(host.getParameterValue, handle),
      displayValue: readCallResult(host.getParameterDisplayValue, handle)
   }))
      .filter(param => Object.values(param).every(prop => prop !== null));
}
   
async function fetchTrackTypes(handles) {
   return await Promise.all(handles.map(handle =>
      callAndWriteResult(host.getTrackType, handle)
   ));
}

async function fetchTrackDetails(handles) {
   const calls = [
      host.getTrackType,
      host.getTrackName,
      host.getTrackVolume,
      host.getTrackPan,
      host.isTrackMute,
      host.getTrackPlugins
   ];

   return await Promise.all(
      handles.flatMap(handle => calls.map(fn => callAndWriteResult(fn, handle)))
   )
   .then(flat =>
      Array.from({length: handles.length}, (_, i) =>
         flat.slice(i * calls.length, i * calls.length + calls.length)
      )
   )
   .then(groups =>
      groups.map(([type, name, volume, pan, isMuted, pluginHandles], i) =>
         ({ handle: handles[i], type, name, volume, pan, isMuted, pluginHandles })
      )
   );
}

async function fetchParameterDetails(handles) {
   const calls = [
      host.getParameterName,
      host.getParameterValue,
      host.getParameterDisplayValue
   ];

   return await Promise.all(
      handles.flatMap(handle =>
         calls.map(fn => callAndWriteResult(fn, handle)))
      )
      .then(flat =>
         Array.from({length: handles.length}, (_, i) =>
            flat.slice(i * calls.length, i * calls.length + calls.length)
         )
      )
      .then(groups => 
         groups.map(([name, value, displayValue], i) =>
            ({ handle: handles[i], name, value, displayValue })
         )
      );
}
