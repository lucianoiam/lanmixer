// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useState } from '/lib/react.js';
import { useImmutableState } from '/lib/host.js';
import { PluginView } from '/plugin.js';
import { TrackStrip } from '/lib/widget.js';

const { host } = dawscript;

   
export default function TrackView({ track }) {
   const plugins = useImmutableState([], track, host.getTrackPlugins);

   const [count, setCount] = useState(0);
   const onChildReady = () => setCount((p) => p + (p < plugins.length ? 1 : 0));
   const isReady = (count > 0) && (count == plugins.length);

   return h`
      <div
         className="flex flex-row flex-wrap"
      >
         <${TrackStrip}
            track=${track}
         />
         <ul
            className="flex flex-row"
            style=${{
               visibility: true ? '' : 'hidden'   
            }}
         >
            ${plugins.map(plugin => h`
               <li
                  key=${plugin}
               >
                  <${PluginView}
                     plugin=${plugin}
                     onReady=${onChildReady}
                  />
               </li>
            `)}
         </ul>
      </div>
   `;
}
