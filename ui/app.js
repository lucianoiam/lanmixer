// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, createElement, render } from './lib/react.js';
import { enableCacheDebugMessages } from './lib/cache.js';
import { SessionProvider } from './lib/state.js';
import OfflineView from './lib/offline.js';
import MainView from './main.js';


let loaderElem = null;

function main() {
   loaderElem = document.getElementById('loader').cloneNode(true);
   
   const scriptSel = `script[src="${import.meta.url.split('/').pop()}"]`;

   if (document.querySelector(scriptSel).dataset.debugMessages === 'true') {
      enableCacheDebugMessages();
      dawscript.enableDebugMessages();
   }

   render(createElement(AppView), document.body);
}

export default function Loader({ message }) {
   loaderElem.classList.remove('invisible');
   loaderElem.querySelector('span').textContent = message;
   const props = { dangerouslySetInnerHTML: { __html: loaderElem.outerHTML } };

   return createElement('div', props);
}

function AppView() {
   return H`
      <${SessionProvider}>
         <div
            className="relative size-app"
         >
            <${MainView}
               className="absolute inset-0"
            />
            <${OfflineView}
               className="absolute inset-0"
            />
         </div>
      </${SessionProvider}>
   `;
}

main();
