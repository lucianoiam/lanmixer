// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, createElement } from './react.js';
import { useImmutableState, useMutableState } from './state.js';
import { KnobComponent, FaderComponent, ButtonComponent }
   from '/vendor/guinda/guinda.react.module.js';

const { host } = dawscript;
const loaderElem = document.getElementById('loader').cloneNode(true);

export function Loader({ message }) {
   loaderElem.classList.remove('invisible');
   loaderElem.querySelector('span').textContent = message;
   const props = { dangerouslySetInnerHTML: { __html: loaderElem.outerHTML } };

   return createElement('div', props);
}

export function TrackLabel({ track }) {
   const name = useImmutableState('', track, host.getTrackName);

   return H`
      <span>
         ${name}
      </span>
   `;
}

export function VolumeFader({ track, className }) {
   const state = useMutableState(0, track, {
      get: host.getTrackVolume,
      set: host.setTrackVolume,
      addListener: host.addTrackVolumeListener,
      removeListener: host.removeTrackVolumeListener
   });

   return createGuindaElement(
      FaderComponent,
      state,
      {
         className,
         style: {
            width: 37,
            minHeight: 96
         }
      }
   );
}

export function MuteButton({ track, className }) {
   const state = useMutableState(false, track, {
      get: host.isTrackMute,
      set: host.setTrackMute,
      addListener: host.addTrackMuteListener,
      removeListener: host.removeTrackMuteListener
   });

   return createGuindaElement(
      ButtonComponent,
      state,
      {
         className,
         mode: 'latch',
         style: {
            width: 37,
            height: 37,
            backgroundColor: '#404040'
         }
      }
   );
}

export function PluginEnableButton({ plugin, className }) {
   const state = useMutableState(false, plugin, {
      get: host.isPluginEnabled,
      set: host.setPluginEnabled,
      addListener: host.addPluginEnabledListener,
      removeListener: host.removePluginEnabledListener
   });

   return createGuindaElement(
      ButtonComponent,
      state,
      {
         className,
         mode: 'latch',
         style: {
            width: 24,
            height: 24,
            backgroundColor: '#404040'
         }
      }
   );
}

export function PanKnob({ track, className }) {
   const state = useMutableState(0, track, {
      get: host.getTrackPan,
      set: host.setTrackPan,
      addListener: host.addTrackPanListener,
      removeListener: host.removeTrackPanListener
   });

   return createGuindaElement(
      KnobComponent,
      state,
      {
         className,
         style: {
            width: 48,
            height: 48
         }
      }
   );
}

export function ParameterKnob({ param, className }) {
   const state = useMutableState(0, param, {
      get: host.getParameterValue,
      set: host.setParameterValue,
      addListener: host.addParameterValueListener,
      removeListener: host.removeParameterValueListener
   });

   return createGuindaElement(
      KnobComponent,
      state,
      {
         className,
         style: {
            width: 56,
            height: 56
         }
      }
   );
}

function createGuindaElement(Component, state, props = {}) {
   const [value, setValue] = state;
   return createElement(
      Component,
      {
         value,
         defaultValue: value,
         onInput: (e) => setValue(e.target.value),
         ...props
      }
   );
}
