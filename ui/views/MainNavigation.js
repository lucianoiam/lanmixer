// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import ConditionalScroll from '../widgets/ConditionalScroll.js';
import { TrackNameLabel } from '../widgets/TrackNameLabel.js';
import NavigationButton from '../widgets/NavigationButton.js';


export default function MainNavigationView({
   tracks,
   selectedTrack,
   onChange,
   className = '',
   style = {}
}) {
   const filteredTracks = tracks.filter(t => t.pluginHandles.length > 0);

   return H`
      <div
         className="flex flex-col w-42 ${className}"
         style="${style}"
      >
         <${NavigationButton}
            isSelected=${selectedTrack == null}
            onClick=${onChange}
         >
            MIXER
         </${NavigationButton}>
         <${ConditionalScroll}
            className="flex flex-col gap-2 pt-2 h-full"
            noScrollClass="justify-evenly pb-20"
         >
            <ul
               className="contents"
            >
               ${filteredTracks.map(track => H`
                  <li
                     key=${track.handle}
                  >
                     <${NavigationButton}
                        target=${track}
                        isSelected=${selectedTrack == track}
                        onClick=${onChange}
                     >
                        <${TrackNameLabel}
                           handle=${track.handle}
                        />
                     </${NavigationButton}>
                  </li>
               `)}
            </ul>
         </${ConditionalScroll}>
      </div>
   `;
}
