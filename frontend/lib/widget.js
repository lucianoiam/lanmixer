// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement, useEffect, useState }
   from '/lib/preact+htm.js';
import { KnobComponent, FaderComponent, ButtonComponent }
   from '/vendor/guinda/guinda.react.module.js';

const { host } = dawscript;

const MIN_VOLUME = -64.0;
const MAX_VOLUME = 6.0

function TrackVolumeFader({ track, ...props }) {
   const [value, setValue] = useState(MIN_VOLUME);

   const onInput = (e) => {
      host.setTrackVolume(track, e.target.value);
   };

   useEffect(async () => {
      setValue(await host.getTrackVolume(track));

      host.addTrackVolumeListener(track, setValue);

      return () => {
         host.removeTrackVolumeListener(track, setValue);
      };
   }, [track, setValue]);

   return createElement(
      FaderComponent, {
         ...props,
         value,
         onInput,
         min: MIN_VOLUME,
         max: MAX_VOLUME
      }
   );
}

function TrackMuteButton({ track, ...props }) {
   const [value, setValue] = useState(false);

   const onInput = (e) => {
      host.setTrackMute(track, e.target.value);
   };

   useEffect(async () => {
      setValue(await host.isTrackMute(track));

      host.addTrackMuteListener(track, setValue);

      return () => {
         host.removeTrackMuteListener(track, setValue);
      };
   }, [track, setValue]);

   return createElement(
      ButtonComponent, {
         ...props,
         value,
         onInput
      }
   );
}

export function TrackStrip({ track, className, style, ...props }) {
   const [name, setName] = useState('');

   useEffect(async () => {
      setName(await host.getTrackName(track));
   }, [track, setName]);

   className += (name && name.indexOf('MIDI') === -1) ? ""
      : " pointer-events-none opacity-25";

   return h`
      <div
         className="flex flex-col items-center gap-5 ${className}"
         style=${style}
      >
         <div style=${{ height: '1em' }}>
            ${name}
         </div>
         <${TrackVolumeFader}
            track=${track}
            ...${props}
            style=${{
               width: 37,
               height: 200
            }}
         />
         <${TrackMuteButton}
            track=${track}
            ...${props}
            mode="latch"
            style=${{
               width: 37,
               height: 37,
               backgroundColor: '#404040'
            }}
         />
      </div>
   `;
}

export function ParameterValueKnob({ param, ...props }) {
   const [value, setValue] = useState(0);
   const [range, setRange] = useState([ 0, 1.0 ]);

   const onInput = (e) => {
      host.setParameterValue(param, e.target.value);
   };

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
         ...props,
         value,
         onInput,
         min: range[0],
         max: range[1]
      }
   );
}
