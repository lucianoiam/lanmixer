// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { PluginView } from './plugin.js';
import { TrackMuteButton, TrackNameLabel, TrackPanKnob, TrackVolumeFader }
   from '../lib/widget.js';

export default function FullTrackView({ track, className }) {
   return H`
      <div
         className="flex flex-row h-full ${className}"
      >
         <div className="w-36 bg-neutral-900">
            TODO: Plugins nav
         </div>
         <ul
            className="flex-1 flex flex-col gap-5 p-5 pr-0 overflow-auto"
         >
            ${track.plugins.map(plugin => H`
               <li
                  key=${plugin.handle}
                  className="flex flex-row"
               >
                  <${PluginView}
                     handle=${plugin}
                  />
                  <!-- Push scrollbar to the right -->
                  <div
                     className="flex-1"
                  >
                  </div>
               </li>
            `)}
         </ul>
         <div className="flex items-center">
            <${TrackStrip}
               track=${track}
               className="p-5 shrink-0"
            />
         </div>
      </div>
   `;
}

export function TrackStrip({ track, className }) {
   return H`
      <div
         className="flex flex-col items-center gap-10 h-full w-36 ${className}"
      >
         <${TrackNameLabel}
            handle=${track.handle}
         />
         <${TrackPanKnob}
            handle=${track.handle}
         />
         <${TrackVolumeFader}
            handle=${track.handle}
            className="flex-1"
         />
         <${TrackMuteButton}
            handle=${track.handle}
         />
         <div
            className="h-[6%]"
         />
      </div>
   `;
}
