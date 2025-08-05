// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect } from '../../lib/react.js';
import ConditionalScroll from '../widget/ConditionalScroll.js';
import NavigationButton from '../widget/NavigationButton.js';


export default function PluginNavigation({
   plugins,
   selection,
   onSelect,
   className = '',
   style = {}
}) {
   useEffect(() => {
      if (plugins.length > 0 && selection == null) {
         onSelect(plugins[0]);
      }
   }, [plugins, selection, onSelect]);

   const names = plugins.map(plugin => plugin.name);

   return H`
      <${ConditionalScroll}
         className="flex flex-col gap-2 w-42 ${className}"
         style="${style}"
      >
         <ul
            className="contents"
         >
            ${names.map((name, i) => H`
               <li
                  key=${plugins[i]}
               >
                  <${NavigationButton}
                     target=${plugins[i]}
                     isSelected=${selection == plugins[i]}
                     onClick=${() => onSelect(plugins[i])}
                  >
                     <span>${name}</span>
                  </${NavigationButton}>
               </li>
            `)}
         </ul>
      </${ConditionalScroll}>
   `;
}
