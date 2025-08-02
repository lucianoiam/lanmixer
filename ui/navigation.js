// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useRef } from './lib/react.js';
import { TrackNameLabel } from './lib/widget.js';

export default function MainNavigationView({
   tracks,
   selectedTrack,
   onChange,
   className
}) {
   return H`
      <div
         className="flex flex-col bg-neutral-900 ${className}"
      >
         <ul
            className="flex-1 flex flex-col justify-end overflow-auto"
         >
            ${tracks.filter(t => t.plugins.length > 0).map(track => H`
               <li
                  key=${track.handle}
               >
                  <${NavigationButton}
                     track=${track}
                     isSelected=${selectedTrack == track}
                     onClick=${onChange}
                  />
               </li>
            `)}
         </ul>
         <${NavigationButton}
            className="h-20"
            isSelected=${selectedTrack == null}
            onClick=${onChange}
         >
            MIXER
         </${NavigationButton}>
      </div>
   `;
}

function NavigationButton({ track, isSelected, onClick, className, children }) {
  const ref = useRef();

  useEffect(() => {
      if (ref.current) {
         ref.current.value = isSelected;
      }
   }, [isSelected]);

   return H`
      <g-button
         ref=${ref}
         className="w-full h-14 ${className}"
         mode="none"
         touch="false"
         defaultValue="${isSelected}"
         onClick=${() => onClick(track)}
      >
         ${track ?H`
            <${TrackNameLabel}
               handle=${track.handle}
            />
         `:
            children
         }
      </g-button>
   `;
}