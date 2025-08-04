// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useRef } from '../../lib/react.js';
import { usePlugins } from '../../lib/view-state.js';
import LoaderView from '../widget/LoaderView.js';
import PluginView from './PluginView.js';


export default function TrackPluginsView({
   handles,
   focus,
   className = '',
   style = {}
}) {
   const plugins = usePlugins(handles);
   const listRef = useRef();

   useEffect(() => {
      if (!focus || !listRef.current) return;
      const index = handles.indexOf(focus);
      if (index >= 0) {
         const list = listRef.current;
         const item = list.children[index];
         if (item) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
         }
      }
   }, [focus, handles]);

   if (!plugins) {
      return H`<${LoaderView}
         message="PLUGINS"
         className="size-full ${className}"
         style="${style}"
      />`;
   }

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
               >
                  <${PluginView}
                     plugin=${plugin}
                  />
               </li>
            `)}
         </ul>
      </div>`;
}
