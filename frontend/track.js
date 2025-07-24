// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useState } from '/lib/react.js';
import { useImmutableState } from '/lib/host.js';
import { PluginView } from '/plugin.js';
import { TrackStrip } from '/lib/widget.js';

const { host } = dawscript;

   
export default function TrackView({ track }) {
   const plugins = useImmutableState([], track, host.getTrackPlugins);

   return h`
      <div
         className="flex flex-row gap-10"
      >
         <${TrackStrip}
            track=${track}
         />
         <ul
            className="flex flex-row gap-30"
         >
            ${plugins.map(plugin => h`
               <li
                  key=${plugin}
               >
                  <${PluginView}
                     plugin=${plugin}
                  />
               </li>
            `)}
         </ul>
      </div>
   `;
}
