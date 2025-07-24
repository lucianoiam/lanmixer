// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useAsyncEffect, useState } from './lib/react.js';
import { useImmutableState } from './lib/host.js';
import { precacheCallResult, hasCachedCallResult } from './lib/cache.js';
import { ParameterKnob } from './lib/widget.js';

const { host } = dawscript;


export function PluginView({ plugin }) {
   const name = useImmutableState('', plugin, host.getPluginName);
   const params = useImmutableState([], plugin, host.getPluginParameters);
   const hostName = useImmutableState('', plugin, host.name);
   const skipPrecache = hostName == 'bitwig';
   const isParamsNonEmpty = params.length > 0;

   const [isReady, setReady] = useState(
      skipPrecache || (
      isParamsNonEmpty &&
         params.every(param =>
            hasCachedCallResult(host.getParameterName, param) &&
            hasCachedCallResult(host.getParameterRange, param) &&
            hasCachedCallResult(host.getParameterValue, param)
         )
      )
   );

   useAsyncEffect(async () => {
      if (hostName && isParamsNonEmpty) {
         if (! skipPrecache) {
            await Promise.all(params.map(param =>
               precacheCallResult([
                  [host.getParameterName, param],
                  [host.getParameterRange, param],
                  [host.getParameterValue, param]
               ])
            ));
         }
         setReady(true);
      }
   }, [hostName, isParamsNonEmpty]);

   return H`
      <div
         className="flex flex-col"
      >
         ${name && isReady ? H`
            <span>
               ${name}
            </span>
         `:H`
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
            ${params.map(param => H`
               <li
                  key=${param}
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
   const name = useImmutableState('', param, host.getParameterName);

   return H`
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
