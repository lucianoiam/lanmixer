// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, createElement } from '../lib/react.js';
import { host } from '../lib/dawscript.js';
import { useObjectField, useObjectState } from '../lib/host.js';
import { KnobComponent, FaderComponent, ButtonComponent }
   from '../vendor/guinda/guinda.react.module.js';


export function TrackNameLabel({
   handle,
   className = '',
   style = {}
}) {
   const name = useObjectField('', handle, host.getTrackName);

   return H`
      <span
         class="${className}"
         style="${style}"
      >
         ${name}
      </span>
   `;
}

export function TrackVolumeFader({
   handle,
   className = '',
   style = {}
}) {
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
            minHeight: 96,
            ...style
         }
      }
   );
}

export function TrackMuteButton({
   handle,
   className = '',
   style = {}
}) {
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
            backgroundColor: '#404040',
            ...style
         }
      }
   );
}

export function PluginEnableButton({
   handle,
   className = '',
   style = {}
}) {
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
            backgroundColor: '#404040',
            ...style
         }
      }
   );
}

export function TrackPanKnob({
   handle,
   className = '',
   style = {}
}) {
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
            height: 48,
            ...style
         }
      }
   );
}

export function ParameterValueKnob({
   handle,
   className = '',
   style = {}
}) {
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
            height: 56,
            ...style
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
