// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { useImmutableState } from '../lib/state.js';
import { MuteButton, PanKnob, TrackLabel, VolumeFader } from '../lib/widget.js';
import { PluginView } from './plugin.js';

const { host } = dawscript;


export default function FullTrackView({ track, className }) {
   const plugins = useImmutableState([], track, host.getTrackPlugins);

   return H`
      <div
         className="flex flex-row pl-5 h-full ${className}"
      >
         <${TrackStrip}
            track=${track}
            className="p-5 shrink-0"
         />
         <ul
            className="flex-1 flex flex-col gap-5 p-5 overflow-auto"
         >
            ${plugins.map(plugin => H`
               <li
                  key=${plugin}
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
         </ul>
      </div>
   `;
}

export function TrackStrip({ track, className }) {
   return H`
      <div
         className="flex flex-col items-center gap-5 w-24 ${className}"
      >
         <${TrackLabel}
            track=${track}
         />
         <${PanKnob}
            track=${track}
         />
         <${VolumeFader}
            track=${track}
         />
         <${MuteButton}
            track=${track}
         />
      </div>
   `;
}
