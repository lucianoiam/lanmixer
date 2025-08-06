// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { host } from '../lib/dawscript.js';
import { useObjectField } from '../lib/state-host.js';
import { ListenerParameterValueKnob } from '../widgets/ListenerWidget.js';


export default function ParameterView({
   param,
   className = '',
   style = {}
}) {
   const displayValue = useObjectField('', param.handle, {
      get: host.getParameterDisplayValue,
      addListener: host.addParameterDisplayValueListener,
      removeListener: host.removeParameterDisplayValueListener
   });

   return H`
      <div
         className="flex flex-col items-center w-36 p-3 gap-2 border border-neutral-800 rounded ${className}"
         style="${style}"
      >
         <div className="font-mono text-sx text-center h-[3rem] line-clamp-2">
            ${displayValue}
         </div>
         <${ListenerParameterValueKnob}
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
