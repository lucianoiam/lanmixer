// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement, useEffect, useState }
   from './preact+htm.js';
import { KnobComponent, FaderComponent, ButtonComponent }
   from '/vendor/guinda/guinda.react.module.js';

const { host } = dawscript;

const MIN_VOLUME = -64.0;
const MAX_VOLUME = 6.0


export function TrackLabel({
   track
}) {
   const [name, setName] = useState('');

   useEffect(async () => {
      setName(await host.getTrackName(track));
   }, [track, setName]);

   return h`
      <label>
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
   const [value, setValue] = useState(MIN_VOLUME);

   const onInput = (e) => host.setTrackVolume(track, e.target.value);

   useEffect(async () => {
      setValue(await host.getTrackVolume(track));

      host.addTrackVolumeListener(track, setValue);

      return () => {
         host.removeTrackVolumeListener(track, setValue);
      };
   }, [track, setValue]);

   return createElement(
      FaderComponent, {
         value,
         onInput,
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
   const [value, setValue] = useState(false);

   const onInput = (e) => host.setTrackMute(track, e.target.value);

   useEffect(async () => {
      setValue(await host.isTrackMute(track));

      host.addTrackMuteListener(track, setValue);

      return () => {
         host.removeTrackMuteListener(track, setValue);
      };
   }, [track, setValue]);

   return createElement(
      ButtonComponent, {
         value,
         onInput,
         mode: 'latch',
         style: {
            width: 37,
            height: 37,
            backgroundColor: '#404040'
         }
      }
   );
}

export function FXButton({
   track,
   onClick
}) {
   const onInput = (ev) => onClick(track, ev.currentTarget.value);

   return createElement(
      ButtonComponent, {
         onInput,
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
   const [value, setValue] = useState(0);
   const [range, setRange] = useState([ 0, 1.0 ]);

   const onInput = (e) => host.setParameterValue(param, e.target.value);

   useEffect(async () => {
      setRange(await host.getParameterRange(param));
      setValue(await host.getParameterValue(param));

      host.addParameterValueListener(param, setValue);

      return () => {
         host.removeParameterValueListener(param, setValue);
      };
   }, [param, setValue]);

   return createElement(
      KnobComponent, {
         value,
         onInput,
         min: range[0],
         max: range[1]
      }
   );
}
