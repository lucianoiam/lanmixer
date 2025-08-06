// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import ConditionalScroll from '../widgets/ConditionalScroll.js';
import TrackStripView from './TrackStripView.js';


export default function MixerView({
   tracks,
   className = '',
   style = {}
}) {
   return H`
      <${ConditionalScroll}
         className="flex flex-row w-full ${className}"
         style="${style}"
      >
         <ul
            className="contents"
         >
            ${tracks.map(track => H`
               <li>
                  <${TrackStripView}
                     track=${track}
                  />
               </li>
            `)}
         </ul>
      </${ConditionalScroll}>
   `;
}
