// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useAsyncEffect, useState } from '../lib/react.js';
import { useImmutableState } from '../lib/state.js';
import { callAndCacheResult, hasCachedCallResult } from '../lib/cache.js';
import { ParameterKnob, PluginEnableButton } from '../lib/widget.js';

const { host } = dawscript;


export function PluginView({ plugin }) {
   const name = useImmutableState('', plugin, host.getPluginName);
   const params = useImmutableState([], plugin, host.getPluginParameters);

   const [isReady, setReady] = useState(
      hasCachedCallResult(host.isPluginEnabled, plugin) &&
      hasCachedCallResult(host.getPluginName, plugin) &&
      hasCachedCallResult(host.getPluginParameters, plugin) &&
      params.every(param =>
         hasCachedCallResult(host.getParameterName, param) &&
         hasCachedCallResult(host.getParameterValue, param) &&
         hasCachedCallResult(host.getParameterDisplayValue, param)
      )
   );

   useAsyncEffect(async () => {
      if (params.length > 0) {
         await Promise.all([
            callAndCacheResult(host.isPluginEnabled, plugin),
            callAndCacheResult(host.getPluginName, plugin),
            callAndCacheResult(host.getPluginParameters, plugin),
            ...params.flatMap(param => [
               callAndCacheResult(host.getParameterName, param),
               callAndCacheResult(host.getParameterValue, param),
               callAndCacheResult(host.getParameterDisplayValue, param)
            ])
         ]);

         setReady(true);
      }
   }, [params]);

   if (! isReady) {
      return null;
   }

   return H`
      <div
         className="flex flex-col gap-5 p-5 bg-neutral-900"
      >
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
         <ul
            className="flex flex-row flex-wrap gap-5"
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
   const displayValue = useImmutableState('', param, {
      get: host.getParameterDisplayValue,
      addListener: host.addParameterDisplayValueListener,
      removeListener: host.removeParameterDisplayValueListener
   });

   return H`
      <div
         className="flex flex-col items-center gap-2 w-24 h-32"
      >
         <h1>
            ${name}
         </h1>
         <div className="font-mono text-sx">
            ${displayValue}
         </div>
         <${ParameterKnob}
            param=${param}
         />
      </div>
   `;
}
