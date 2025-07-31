// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { TrackLabel } from '../lib/widget.js';
import { TrackStrip } from './track.js';


export default function MixerView({ tracks }) {
   return H`
      <ul
         className="flex flex-row"
      >
         ${tracks.map(track => H`
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
