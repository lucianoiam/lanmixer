// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { PluginEnableButton } from '../widget/GuindaWidget.js';
import ParameterView from './ParameterView.js';


export default function PluginView({
   plugin,
   className = '',
   style = {}
}) {
   return H`
      <div
         className="flex flex-col gap-5 p-5 bg-neutral-900 ${className}"
         style="${style}"
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
