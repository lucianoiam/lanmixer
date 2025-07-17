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
   const [name, setName] = useHostState('', host.getTrackName, track);

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
   const [value, setValue] = useHostState(MIN_VOLUME,
      [host.getTrackVolume, host.setTrackVolume], track);

   const onInput = (e) => {
      const value = e.target.value;
      setValue(value);
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
   const [value, setValue] = useHostState(false,
      [host.isTrackMute, host.setTrackMute], track);

   const onInput = (e) => {
      const value = e.target.value;
      setValue(value);
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
   const [value, setValue] = useHostState(0,
      [host.getParameterValue, host.setParameterValue], param);
   const [range, setRange] = useHostState([ 0, 1.0 ], host.getParameterRange,
      param);

   const onInput = (e) => {
      const value = e.target.value;
      setValue(value);
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
