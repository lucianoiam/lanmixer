// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useRef, useState } from '../../lib/react.js';
import { useTrackPlugins } from '../lib/state-views.js';
import LoaderView from '../widgets/LoaderView.js';
import TrackStripView from './TrackStripView.js';
import PluginNavigation from './PluginNavigation.js';
import PluginView from './PluginView.js';


export default function TrackView({
   track,
   className = '',
   style = {}
}) {
   const plugins = useTrackPlugins(track);
   const [selectedPlugin, selectPlugin] = useState(null);
   const pluginListRef = useRef();

   useEffect(() => {
      if (! plugins) {
         return;
      }

      if (selectedPlugin) {
         const index = plugins.indexOf(selectedPlugin);
         if (index >= 0) {
            pluginListRef.current?.children[index]
               ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
         }
      } else {
         selectPlugin(plugins[0]);
      }
   }, [plugins, selectedPlugin]);

   if (! plugins) {
      return H`
         <${LoaderView}
            message="PLUGINS"
            className="size-full ${className}"
            style="${style}"
         />`;
   }

   return H`
      <div
         className="flex flex-row size-full ${className}"
         style="${style}"
      >
         <${PluginNavigation}
            key=${track.handle}
            plugins=${plugins}
            className="pr-2"
            selection=${selectedPlugin}
            onSelect=${selectPlugin}
         />
         <div
            className="flex-1 flex flex-col items-center gap-2 overflow-auto"
         >
            <ul
               ref=${pluginListRef}
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
         </div>
         <${TrackStripView}
            track=${track}
            className="p-5"
         />
      </div>
   `;
}
