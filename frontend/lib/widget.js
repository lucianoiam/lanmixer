// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement, useEffect } from './preact+htm.js';
import { useHostState } from './state.js';
import { KnobComponent, FaderComponent, ButtonComponent }
   from '/vendor/guinda/guinda.react.module.js';

const { host } = dawscript;

const MIN_VOLUME = -64.0;
const MAX_VOLUME = 6.0


export function TrackLabel({
   track
}) {
   const [name, setName] = useHostState('', `${track}_label`,
      () => host.getTrackName(track));

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
   const [value, setValue] = useHostState(MIN_VOLUME, `${track}_volume`,
      () => host.getTrackVolume(track));

   const onInput = (e) => {
      const value = e.target.value;
      setValue(value);
      host.setTrackVolume(track, value);
   };

   useEffect(async () => {
      host.addTrackVolumeListener(track, setValue);

      return () => {
         host.removeTrackVolumeListener(track, setValue);
      };
   }, [track]);

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
   const stateKey = `${track}_mute`;
   const [value, setValue] = useHostState(false, stateKey,
      () => host.isTrackMute(track));

   const onInput = (e) => {
      const value = e.target.value;
      setValue(value);
      host.setTrackMute(track, e.target.value);
   };

   useEffect(async () => {
      host.addTrackMuteListener(track, setValue);

      return () => {
         host.removeTrackMuteListener(track, setValue);
      };
   }, [track]);

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
   const [value, setValue] = useHostState(0, `${param}_value`,
      () => host.getParameterValue(param));
   const [range, setRange] = useHostState([ 0, 1.0 ], `${param}_range`,
      () => host.getParameterRange(param));

   const onInput = (e) => {
      const value = e.target.value;
      setValue(value);
      host.setParameterValue(param, value);
   };

   useEffect(async () => {
      host.addParameterValueListener(param, setValue);

      return () => {
         host.removeParameterValueListener(param, setValue);
      };
   }, [param]);

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
