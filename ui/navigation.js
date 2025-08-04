// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useRef } from './lib/react.js';
import { ConditionalScroll } from './lib/container.js';
import { TrackNameLabel } from './lib/widget.js';

export default function MainNavigationView({
   tracks,
   selectedTrack,
   onChange,
   className
}) {
   const filteredTracks = tracks.filter(t => t.pluginHandles.length > 0);

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
         <${ConditionalScroll}
            className="flex flex-col gap-2 pt-2 pb-20 max-h-full"
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