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
         className="flex flex-col ${className}"
      >
         <${NavigationButton}
            isSelected=${selectedTrack == null}
            onClick=${onChange}
         >
            MIXER
         </${NavigationButton}>
         <ul
            className="flex-1 flex flex-col gap-2 justify-center overflow-auto pb-20"
         >
            ${tracks.filter(t => t.pluginHandles.length > 0).map(track => H`
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
      </div>
   `;
}

export function NavigationButton({
   target,
   isSelected,
   onClick,
   className,
   children
}) {
  const ref = useRef();

  useEffect(() => {
      if (ref.current) {
         ref.current.value = isSelected;
      }
   }, [isSelected]);

   return H`
      <g-button
         ref=${ref}
         className="w-full h-14 bg-neutral-800 ${className}"
         mode="none"
         touch="false"
         defaultValue="${isSelected}"
         onClick=${() => onClick(target)}
      >
         ${children}
      </g-button>
   `;
}