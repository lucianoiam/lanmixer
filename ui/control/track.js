// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { useImmutableState } from '../lib/state.js';
import { MuteButton, PanKnob, VolumeFader } from '../lib/widget.js';
import { PluginView } from './plugin.js';

const { host } = dawscript;

   
export default function FullTrackView({ track }) {
   const plugins = useImmutableState([], track, host.getTrackPlugins);

   return H`
      <div
         className="flex flex-row gap-10"
      >
         <${TrackStrip}
            track=${track}
         />
         <ul
            className="flex flex-col gap-5"
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

export function TrackStrip({ track }) {
   return H`
      <div
         className="flex flex-col items-center gap-5"
      >
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
