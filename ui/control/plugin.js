// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { useObjectField } from '../lib/host.js';
import { ParameterValueKnob, PluginEnableButton } from '../lib/widget.js';

const { host } = dawscript;

export function PluginView({ plugin }) {
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
               className=" text-xl font-bold flex-1 text-center"
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
   const displayValue = useObjectField('', param.handle, {
      get: host.getParameterDisplayValue,
      addListener: host.addParameterDisplayValueListener,
      removeListener: host.removeParameterDisplayValueListener
   });

   return H`
      <div
         className="flex flex-col items-center w-36 p-3 gap-2 border border-neutral-800 rounded"
      >
         <div className="font-mono text-sx text-center h-[3rem] line-clamp-2">
            ${displayValue}
         </div>
         <${ParameterValueKnob}
            handle=${param.handle}
         />
         <div
            className="text-sm text-center text-neutral-500 h-[2.5rem] line-clamp-2"
         >
            ${param.name}
         </div>
      </div>
   `;
}
