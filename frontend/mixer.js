// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h } from '/lib/react.js';
import { TrackLabel, TrackStrip } from '/lib/widget.js';


export default function MixerView({ tracks }) {
   return h`
      <ul
         className="flex flex-row"
      >
         ${tracks.map(track => h`
            <li
               key=${track}
               className="flex flex-col gap-5 items-center"
               style=${{
                  width: 120   
               }}
            >
               <${TrackLabel}
                  track=${track}
               />
               <${TrackStrip}
                  track=${track}
               />
            </li>
         `)}
      </ul>
   `;
}
