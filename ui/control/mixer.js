// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { ConditionalScroll } from '../lib/container.js';
import { TrackStrip } from './track.js';

export default function MixerView({ tracks, className }) {
   return H`
      <${ConditionalScroll}
         className="flex flex-row w-full ${className}"
      >
         <ul
            className="contents"
         >
            ${tracks.map(track => H`
               <li>
                  <${TrackStrip}
                     track=${track}
                  />
               </li>
            `)}
         </ul>
      </${ConditionalScroll}>
   `;
}
