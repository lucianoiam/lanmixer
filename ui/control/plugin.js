// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { useImmutableState, usePluginAndParameterDetails }
   from '../lib/state.js';
import { ParameterKnob, PluginEnableButton } from '../lib/widget.js';

const { host } = dawscript;


export function PluginView({ plugin }) {
   const details = usePluginAndParameterDetails(plugin);

   if (! details) {
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
               plugin=${plugin}
            />
            <h1
               className="text-xl font-bold flex-1 text-center"
            >
               ${details.name}
            </h1>
            <div
               style=${{width: 24}}
            />
         </div>
         <ul
            className="inline-flex flex-wrap gap-5 justify-center"
         >
            ${details.params.map(paramDetails => H`
               <li
                  key=${paramDetails.handle}}
               >
                  <${ParameterView}
                     details=${paramDetails}
                  />
               </li>
            `)}
         </ul>
      </div>
   `;
}

function ParameterView({ details }) {
   const displayValue = useImmutableState('', details.handle, {
      get: host.getParameterDisplayValue,
      addListener: host.addParameterDisplayValueListener,
      removeListener: host.removeParameterDisplayValueListener
   });

   return H`
      <div
         className="flex flex-col items-center gap-2 w-24 h-32"
      >
         <h1>
            ${details.name}
         </h1>
         <div className="font-mono text-sx">
            ${displayValue}
         </div>
         <${ParameterKnob}
            param=${details.handle}
         />
      </div>
   `;
}
