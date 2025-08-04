// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect } from '../../lib/react.js';
import { usePluginNames } from '../../lib/state.js';
import ConditionalScroll from '../widget/ConditionalScroll.js';
import NavigationButton from '../widget/NavigationButton.js';


export default function PluginNavigation({ handles, selection, onSelect }) {
   const names = usePluginNames(handles);

   useEffect(() => {
      if (handles.length > 0 && selection == null) {
         onSelect(handles[0]);
      }
   }, [handles, selection, onSelect]);

   return H`
      <${ConditionalScroll}
         className="flex flex-col w-42 gap-2 pr-2"
      >
         <ul className="contents">
            ${names.map((name, i) => H`
               <li
                  key=${handles[i]}
               >
                  <${NavigationButton}
                     target=${handles[i]}
                     isSelected=${selection == handles[i]}
                     onClick=${() => onSelect(handles[i])}
                  >
                     <span>${name}</span>
                  </${NavigationButton}>
               </li>
            `)}
         </ul>
      </${ConditionalScroll}>
   `;
}
