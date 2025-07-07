// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement, useEffect } from './preact+htm.js';
import { useEffectIfCacheEmpty, useStateWithCache } from './cache.js';
import { KnobComponent, FaderComponent, ButtonComponent }
   from '/vendor/guinda/guinda.react.module.js';

const { host } = dawscript;

const MIN_VOLUME = -64.0;
const MAX_VOLUME = 6.0


export function TrackLabel({
   track
}) {
   const stateKey = `${track}_label`;
   const [name, setName] = useStateWithCache(stateKey, '');

   useEffectIfCacheEmpty(stateKey, async () => {
      setName(await host.getTrackName(track));
   }, [track]);

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
   const stateKey = `${track}_volume`;
   const [value, setValue] = useStateWithCache(stateKey, MIN_VOLUME);

   const onInput = (e) => {
      const value = e.target.value;
      setValue(value);
      host.setTrackVolume(track, value);
   }

   useEffectIfCacheEmpty(stateKey, async () => {
      setValue(await host.getTrackVolume(track));
   });

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
   const [value, setValue] = useStateWithCache(stateKey, false);

   const onInput = (e) => {
      const value = e.target.value;
      setValue(value);
      host.setTrackMute(track, e.target.value);
   }

   useEffectIfCacheEmpty(stateKey, async () => {
      setValue(await host.isTrackMute(track));
   });

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
   const valueStateKey = `${param}_value`;
   const [value, setValue] = useStateWithCache(valueStateKey, 0);
   const rangeStateKey = `${param}_range`;
   const [range, setRange] = useStateWithCache(rangeStateKey, [ 0, 1.0 ]);

   const onInput = (e) => {
      const value = e.target.value;
      setValue(value);
      host.setParameterValue(param, value);
   }

   useEffectIfCacheEmpty(valueStateKey, async () => {
      setValue(await host.getParameterValue(param));
   });

   useEffectIfCacheEmpty(rangeStateKey, async () => {
      setRange(await host.getParameterRange(param));
   }, [param]);

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
