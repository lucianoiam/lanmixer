// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement, useEffect } from './react.js';
import { useImmutableState, useMutableState } from './host.js';
import { KnobComponent, FaderComponent, ButtonComponent }
   from '/vendor/guinda/guinda.react.module.js';

const { host } = dawscript;

const MIN_VOLUME = -64.0;
const MAX_VOLUME = 6.0


export function TrackLabel({
   track
}) {
   const name = useImmutableState('', track, host.getTrackName);

   return h`
      <label
         style=${{
            height: '1em'
         }}
      >
         ${name}
      </label>
   `;
}

export function TrackStrip({
   track
}) {
   return h`
      <div
         className="flex flex-col items-center gap-5"
      >
         <${VolumeFader}
            track=${track}
         />
         <${MuteButton}
            track=${track}
         />
      </div>
   `;
}

export function VolumeFader({
   track
}) {
   const [value, setValue] = useMutableState(MIN_VOLUME, track,
      host.getTrackVolume, host.setTrackVolume,
      host.addTrackVolumeListener, host.removeTrackVolumeListener);

   const onInput = (e) => {
      const value = e.target.value;
      setValue(value);
   };

   return createElement(
      FaderComponent, {
         onInput,
         value,
         defaultValue: value,
         min: MIN_VOLUME,
         max: MAX_VOLUME,
         style: {
            width: 37,
            height: 200
         }
      }
   );
}

export function MuteButton({
   track
}) {
   const [value, setValue] = useMutableState(false, track,
      host.isTrackMute, host.setTrackMute,
      host.addTrackMuteListener, host.removeTrackMuteListener);

   const onInput = (e) => {
      const value = e.target.value;
      setValue(value);
   };

   return createElement(
      ButtonComponent, {
         onInput,
         value,
         defaultValue: value,
         mode: 'latch',
         style: {
            width: 37,
            height: 37,
            backgroundColor: '#404040'
         }
      }
   );
}

export function PluginsButton({
   track,
   value,
   onClick
}) {
   const onInput = (ev) => onClick(ev.currentTarget.value ? track : null);

   return createElement(
      ButtonComponent, {
         onInput,
         value,
         defaultValue: value,
         mode: 'latch',
         style: {
            width: 37,
            height: 37,
            backgroundColor: '#404040'
         }
      }
   );
}

export function ParameterKnob({
   param
}) {
   const [value, setValue] = useMutableState(0, param,
      host.getParameterValue, host.setParameterValue,
      host.addParameterValueListener, host.removeParameterValueListener);
   const range = useImmutableState([ 0, 1.0 ], param, host.getParameterRange);

   const onInput = (e) => {
      const value = e.target.value;
      setValue(value);
   };

   return createElement(
      KnobComponent, {
         onInput,
         value,
         defaultValue: value,
         min: range[0],
         max: range[1]
      }
   );
}
