// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useRef } from '../lib/react.js';


export default function NavigationButton({
   target, 
   isSelected,
   onClick,
   className = '',
   style = {},
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
         style=${style}
         mode="none"
         touch="false"
         defaultValue="${isSelected}"
         onClick=${() => onClick(target)}
      >
         ${children}
      </g-button>
   `;
}
