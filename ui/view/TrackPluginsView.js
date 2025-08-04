// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useRef } from '../../lib/react.js';
import { usePlugins } from '../../lib/state.js';
import LoaderView from '../widget/LoaderView.js';
import PluginView from './PluginView.js';


export default function TrackPluginsView({ handles, focus, className }) {
   const plugins = usePlugins(handles);
   const listRef = useRef();

   useEffect(() => {
      if (!focus || !listRef.current) return;
      const index = handles.indexOf(focus);
      if (index >= 0) {
         const list = listRef.current;
         const item = list.children[index];
         if (item) {
            list.scrollTo({ top: item.offsetTop, behavior: 'smooth' });
         }
      }
   }, [focus, handles]);

   if (!plugins) {
      return H`<${LoaderView}
         message="PLUGINS"
         className="size-full"
      />`;
   }

   return H`
   <ul
      ref=${listRef}
      className="flex flex-col items-center gap-2 overflow-auto ${className}"
   >
      ${plugins.map(plugin => H`
         <li
            key=${plugin.handle}
            className="flex flex-row"
         >
            <${PluginView}
               plugin=${plugin}
            />
            <!-- Push scrollbar to the right -->
            <div
               className="flex-1"
            >
            </div>
         </li>
      `)}
   </ul>`;
}
