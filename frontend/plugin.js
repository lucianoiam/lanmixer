// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useAsyncEffect, useEffect, useState } from '/lib/react.js';
import { useImmutableState } from '/lib/host.js';
import { preCache } from '/lib/cache.js';
import { ParameterKnob } from '/lib/widget.js';

const { host } = dawscript;


export function PluginView({ plugin, onReady }) {
   const name = useImmutableState('', plugin, host.getPluginName);
   const params = useImmutableState([], plugin, host.getPluginParameters);

   const [count, setCount] = useState(0);
   const onChildReady = () => setCount((p) => p + (p < params.length ? 1 : 0));

   useEffect(() => {
      if ((count > 0) && (count == params.length)) {
         onReady();
      }
   }, [count]);

   return h`
      <div
         className="flex flex-col"
      >
         <span>
            ${name}
         </span>
         <ul>
            ${params.map(param => h`
               <li
                  key=${param}
               >
                  <${ParameterView}
                     param=${param}
                     onReady=${onChildReady}
                  />
               </li>
            `)}
         </ul>
      </div>
   `;
}

function ParameterView({ param, onReady }) {
   useAsyncEffect(async () => {
      await preCache([
         [host.getParameterName, param],
         [host.getParameterRange, param],
         [host.getParameterValue, param]
      ]);

      onReady();
   }, [param]);

   return h`
      <div>
         <span>
            ${name}
         </span>
         <${ParameterKnob}
            param=${param}
         />
      </div>
   `;
}
