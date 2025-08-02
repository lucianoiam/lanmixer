// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { useObjectProperty } from '../lib/ds-state.js';
import { usePlugin } from '../lib/app-state.js';
import { ParameterValueKnob, PluginEnableButton } from '../lib/widget.js';

const { host } = dawscript;

export function PluginView({ handle }) {
   const plugin = usePlugin(handle);

   if (! plugin) {
      return null;
   }

   return H`
      <div
         className="flex flex-col gap-5 p-5 bg-neutral-900"
      >
         <div
            className="flex flex-row"
         >
            <${PluginEnableButton}
               handle=${plugin.handle}
            />
            <h1
               className="text-xl font-bold flex-1 text-center"
            >
               ${plugin.name}
            </h1>
            <div
               style=${{width: 24}}
            />
         </div>
         <ul
            className="inline-flex flex-wrap gap-5 justify-center"
         >
            ${plugin.params.map(param => H`
               <li
                  key=${param.handle}}
               >
                  <${ParameterView}
                     param=${param}
                  />
               </li>
            `)}
         </ul>
      </div>
   `;
}

function ParameterView({ param }) {
   const displayValue = useObjectProperty('', param.handle, {
      get: host.getParameterDisplayValue,
      addListener: host.addParameterDisplayValueListener,
      removeListener: host.removeParameterDisplayValueListener
   });

   return H`
      <div
         className="flex flex-col items-center gap-2 w-24 h-32"
      >
         <h1>
            ${param.name}
         </h1>
         <div className="font-mono text-sx">
            ${displayValue}
         </div>
         <${ParameterValueKnob}
            handle=${param.handle}
         />
      </div>
   `;
}
