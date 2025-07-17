// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h } from '/lib/preact+htm.js';
import { TrackLabel } from '/lib/widget.js';


export default function NavigationView({
   className,
   tracks
}) {
   return h`
      <div
         className="${className}"
      >
         <ul>
            ${tracks.map(track => h`
               <li>
                  <${TrackLabel}
                     track=${track}
                  />
               </li>
            `)}
         </ul>
      </div>
   `;
}
