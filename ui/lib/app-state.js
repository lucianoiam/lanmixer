// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { useAsyncEffect, useState } from './react.js';
import { callAndWriteResult, readCallResult } from './cache.js';
import { useObjectProperty } from './ds-state.js';

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
         await fetchTrackDetails(audHnd);
         setTracks(readTrackDetails(audHnd));
      }
   }, [handles]);

   return tracks;
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
         await fetchParameterDetails(paramHnd);
         setParams(readParameterDetails(paramHnd));
      }
   }, [paramHnd]);

   return (name !== null) && (isEnabled !== null) && (params !== null)
      ? { handle, name, isEnabled, params }
      : null;
}

async function fetchTrackTypes(handles) {
   return await Promise.all(handles.map(handle =>
      callAndWriteResult(host.getTrackType, handle)
   ));
}

function readTrackDetails(handles) {
   return handles.map(handle => ({
      handle,
      type: readCallResult(host.getTrackType, handle),
      name: readCallResult(host.getTrackName, handle),
      volume: readCallResult(host.getTrackVolume, handle),
      pan: readCallResult(host.getTrackPan, handle),
      isMuted: readCallResult(host.isTrackMute, handle),
      plugins: readCallResult(host.getTrackPlugins, handle)
   }))
      .filter(track => Object.values(track).every(prop => prop !== null));
}

async function fetchTrackDetails(handles) {
   await Promise.all(handles.flatMap(handle => [
      callAndWriteResult(host.getTrackType, handle),
      callAndWriteResult(host.getTrackName, handle),
      callAndWriteResult(host.getTrackVolume, handle),
      callAndWriteResult(host.getTrackPan, handle),
      callAndWriteResult(host.isTrackMute, handle),
      callAndWriteResult(host.getTrackPlugins, handle)
   ]));
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

async function fetchParameterDetails(handles) {
   await Promise.all(handles.flatMap(handle => [
      callAndWriteResult(host.getParameterName, handle),
      callAndWriteResult(host.getParameterValue, handle),
      callAndWriteResult(host.getParameterDisplayValue, handle)
   ]));
}
