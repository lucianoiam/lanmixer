// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, createElement } from './react.js';
import { useObjectField, useObjectState } from './host.js';
import { KnobComponent, FaderComponent, ButtonComponent }
   from '/vendor/guinda/guinda.react.module.js';

const { host } = dawscript;
const loaderElem = document.getElementById('loader').cloneNode(true);

export function Loader({ message, className }) {
   loaderElem.querySelector('span').textContent = message;
   const props = {
      dangerouslySetInnerHTML: { __html: loaderElem.outerHTML },
      className
   };
   return createElement('div', props);
}

export function TrackNameLabel({ handle }) {
   const name = useObjectField('', handle, host.getTrackName);

   return H`
      <span>
         ${name}
      </span>
   `;
}

export function TrackVolumeFader({ handle, className }) {
   const state = useObjectState(0, handle, {
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

export function TrackMuteButton({ handle, className }) {
   const state = useObjectState(false, handle, {
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

export function PluginEnableButton({ handle, className }) {
   const state = useObjectState(false, handle, {
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

export function TrackPanKnob({ handle, className }) {
   const state = useObjectState(0, handle, {
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

export function ParameterValueKnob({ handle, className }) {
   const state = useObjectState(0, handle, {
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
