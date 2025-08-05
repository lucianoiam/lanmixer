// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useRef } from '../../lib/react.js';
import PluginView from './PluginView.js';


export default function TrackPluginsView({
   plugins,
   focus,
   className = '',
   style = {}
}) {
   const listRef = useRef();

   useEffect(() => {
      if (!focus || !listRef.current) return;
      const index = plugins.indexOf(focus);
      if (index >= 0) {
         const list = listRef.current;
         const item = list.children[index];
         if (item) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
         }
      }
   }, [focus, plugins]);

   return H`
      <div
         className="flex flex-col items-center gap-2 overflow-auto ${className}"
         style="${style}"
      >
         <ul
            ref=${listRef}
            className="contents"
         >
            ${plugins.map(plugin => H`
               <li
                  key=${plugin.handle}
                  className="w-full"
               >
                  <${PluginView}
                     plugin=${plugin}
                  />
               </li>
            `)}
         </ul>
      </div>`;
}
