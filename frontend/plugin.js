// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useAsyncEffect, useState } from './lib/react.js';
import { useImmutableState } from './lib/state.js';
import { callAndCacheResult, hasCachedCallResult } from './lib/cache.js';
import { ParameterKnob, PluginEnableButton } from './lib/widget.js';

const { host } = dawscript;


export function PluginView({ plugin }) {
   const name = useImmutableState('', plugin, host.getPluginName);
   const params = useImmutableState([], plugin, host.getPluginParameters);
   const isParamsNonEmpty = params.length > 0;

   const [isReady, setReady] = useState(
      isParamsNonEmpty
      && hasCachedCallResult(host.isPluginEnabled, plugin)
      && params.every(param =>
         hasCachedCallResult(host.getParameterName, param) &&
         hasCachedCallResult(host.getParameterRange, param) &&
         hasCachedCallResult(host.getParameterValue, param)
      )
   );

   useAsyncEffect(async () => {
      if (! isReady && isParamsNonEmpty) {
         await Promise.all([
            callAndCacheResult(host.isPluginEnabled, plugin),
            ...params.flatMap(param => [
               callAndCacheResult(host.getParameterName, param),
               callAndCacheResult(host.getParameterRange, param),
               callAndCacheResult(host.getParameterValue, param)
            ])
         ]);

         setReady(true);
      }
   }, [isParamsNonEmpty]);

   return H`
      <div
         className="flex flex-col gap-5 p-5"
         style=${{
            backgroundColor: '#151515'
         }}
      >
         ${name && isReady ? H`
            <div
               className="flex flex-row gap-5 items-center">
               <${PluginEnableButton}
                  plugin=${plugin}
               />
               <h1
                  className="text-xl font-bold"
               >
                  ${name}
               </h1>
            </div>
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
         className="flex flex-col gap-5 w-20 h-24"
      >
         <h1>
            ${name}
         </h1>
         <${ParameterKnob}
            param=${param}
         />
      </div>
   `;
}
