// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useRef } from './lib/react.js';
import { TrackLabel } from './lib/widget.js';


export default function NavigationView({
   tracks,
   selectedTrack,
   onChange,
   className
}) {
   return H`
      <ul
         className="bg-neutral-900 ${className}"
      >
         <li
            key="mixer"
         >
            <${NavigationButton}
               isSelected=${selectedTrack == null}
               onClick=${onChange}
            >
               MIXER
            </${NavigationButton}>
         </li>
         ${tracks.map(track => H`
            <li
               key=${track}
            >
               <${NavigationButton}
                  track=${track}
                  isSelected=${selectedTrack == track}
                  onClick=${onChange}
               />
            </li>
         `)}
      </ul>
   `;
}

function NavigationButton({ track, isSelected, onClick, children }) {
  const ref = useRef();

  useEffect(() => {
      if (ref.current) {
         ref.current.value = isSelected;
      }
   }, [isSelected]);

   return H`
      <g-button
         ref=${ref}
         className="w-full h-10"
         mode="none"
         defaultValue="${isSelected}"
         onClick=${() => onClick(track)}
         onTouchStart=${() => onClick(track)}
      >
         ${track ?H`
            <${TrackLabel}
               track=${track}
            />
         `:
            children
         }
      </g-button>
   `;
}