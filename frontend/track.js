// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from './lib/react.js';
import { useImmutableState } from './lib/state.js';
import { PluginView } from '/plugin.js';
import { TrackStrip } from './lib/widget.js';

const { host } = dawscript;

   
export default function TrackView({ track }) {
   const plugins = useImmutableState([], track, host.getTrackPlugins);

   return H`
      <div
         className="flex flex-row gap-10"
      >
         <${TrackStrip}
            track=${track}
         />
         <ul
            className="flex flex-row gap-24"
         >
            ${plugins.map(plugin => H`
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
