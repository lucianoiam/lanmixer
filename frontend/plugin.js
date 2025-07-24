// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useAsyncEffect, useEffect, useState } from '/lib/react.js';
import { useImmutableState } from '/lib/host.js';
import { preCache } from '/lib/cache.js';
import { ParameterKnob } from '/lib/widget.js';

const { host } = dawscript;


export function PluginView({ plugin }) {
   const name = useImmutableState('', plugin, host.getPluginName);
   const params = useImmutableState([], plugin, host.getPluginParameters);
   const [count, setCount] = useState(0);

   const onParamReady = () => setCount((p) => p + (p < params.length ? 1 : 0));
   const isReady = (name.length > 0) && (count > 0) && (count == params.length);

   return h`
      <div
         className="flex flex-col"
      >
         ${name && isReady ? h`
            <span>
               ${name}
            </span>
         `:h`
            <span>
               Loading...
            </span>
         `}
         <ul
            className="flex flex-row flex-wrap gap-5"
            style=${{
               visibility: isReady ? '' : 'hidden'   
            }}
         >
            ${params.map(param => h`
               <li
                  key=${param}
               >
                  <${ParameterView}
                     param=${param}
                     onReady=${onParamReady}
                  />
               </li>
            `)}
         </ul>
      </div>
   `;
}

function ParameterView({ param, onReady }) {
   const name = useImmutableState('', param, host.getParameterName);

   useAsyncEffect(async () => {
      await preCache([
         [host.getParameterName, param],
         [host.getParameterRange, param],
         [host.getParameterValue, param]
      ]);

      onReady();
   }, [param]);

   return h`
      <div
         className="flex flex-col gap-5 w-20"
      >
         <h1
            className="text-xl font-bold"
         >
            ${name}
         </h1>
         <${ParameterKnob}
            param=${param}
         />
      </div>
   `;
}
