// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useRef } from './lib/react.js';
import { TrackLabel } from './lib/widget.js';


export default function MainNavigationView({
   tracks,
   selectedTrack,
   onChange,
   className
}) {
   const tracksWithPlugins = tracks;

   return H`
      <div
         className="flex flex-col bg-neutral-900 ${className}"
      >
         <ul
            className="flex-1 flex flex-col justify-end overflow-auto"
         >
            ${tracksWithPlugins.map(track => H`
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
            <${TrackLabel}
               track=${track}
            />
         `:
            children
         }
      </g-button>
   `;
}