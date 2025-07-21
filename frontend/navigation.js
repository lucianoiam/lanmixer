// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useEffect } from '/lib/react.js';
import { TrackLabel } from '/lib/widget.js';


export default function NavigationView({ tracks, className }) {
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
