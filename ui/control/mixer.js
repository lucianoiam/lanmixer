// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { TrackStrip } from './track.js';

export default function MixerView({ tracks, className }) {
   return H`
      <ul
         className="flex flex-row justify-center items-center h-full p-5 ${className}"
      >
         ${tracks.map(track => H`
            <li className="h-full">
               <${TrackStrip}
                  track=${track}
               />
            </li>
         `)}
      </ul>
   `;
}
