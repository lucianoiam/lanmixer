// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useState } from '../../lib/react.js';
import { useTrackPlugins } from '../lib/state-views.js';
import LoaderView from '../widgets/LoaderView.js';
import TrackStripView from './TrackStripView.js';
import TrackPluginsView from './TrackPluginsView.js';
import PluginNavigation from './PluginNavigation.js';


export default function TrackView({
   track,
   className = '',
   style = {}
}) {
   const plugins = useTrackPlugins(track);
   const [selectedPlugin, selectPlugin] = useState(null);

   useEffect(() => {
      if (plugins) {
         selectPlugin(plugins[0]);
      }
   }, [plugins]);

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
            className="pr-2 shrink-0"
            selection=${selectedPlugin}
            onSelect=${selectPlugin}
         />
         <${TrackPluginsView}
            className="flex-1"
            plugins=${plugins}
            focus=${selectedPlugin}
         />
         <${TrackStripView}
            track=${track}
            className="p-5"
         />
      </div>
   `;
}
