// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useState } from '../../lib/react.js';
import TrackStripView from './TrackStripView.js';
import TrackPluginsView from './TrackPluginsView.js';
import PluginNavigation from './PluginNavigation.js';


export default function TrackView({
   track,
   className = '',
   style = {}
}) {
   const [selectedPlugin, selectPlugin] = useState(null);

   useEffect(() => {
      selectPlugin(track.pluginHandles[0]);
   }, [track]);

   return H`
      <div
         className="flex flex-row size-full ${className}"
         style="${style}"
      >
         <${PluginNavigation}
            key=${track.handle}
            handles=${track.pluginHandles}
            selection=${selectedPlugin}
            onSelect=${selectPlugin}
         />
         <${TrackPluginsView}
            className="w-full"
            handles=${track.pluginHandles}
            focus=${selectedPlugin}
         />
         <${TrackStripView}
            track=${track}
         />
      </div>
   `;
}


