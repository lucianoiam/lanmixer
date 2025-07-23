// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useEffect, useRef } from '/lib/react.js';
import { TrackLabel } from '/lib/widget.js';

const { host } = dawscript;


function NavigationButton({ track, isSelected, onClick, children }) {
  const ref = useRef();

  useEffect(() => {
      if (ref.current) {
         ref.current.value = isSelected;
      }
   }, [isSelected]);

   return h`
      <g-button
         ref=${ref}
         className="w-full h-10"
         mode="none"
         defaultValue="${isSelected}"
         onClick=${() => onClick(track)}
      >
         ${track ?h`
            <${TrackLabel}
               track=${track}
            />
         `:
            children
         }
      </g-button>
   `;
}

export default function NavigationView({
   tracks,
   selectedTrack,
   onChange,
   className
}) {
   return h`
      <ul
         className=${className}
      >
         <li>
            <${NavigationButton}
               isSelected=${selectedTrack == null}
               onClick=${() => onChange(null)}
            >
               MIXER
            </${NavigationButton}>
         </li>
         ${tracks.map(track => h`
            <li>
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
