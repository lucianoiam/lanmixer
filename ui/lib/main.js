// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, createElement, render } from './react.js';
import { enableCacheDebugMessages } from './cache.js';
import { SessionProvider } from './state-host.js';
import OfflineView from '../views/OfflineView.js';
import MainView from '../views/MainView.js';


function main() {
   const scriptSel = 'script[src="' + new URL(import.meta.url).pathname.slice(1)
      + '"]';

   if (document.querySelector(scriptSel).dataset.debugMessages === 'true') {
      enableCacheDebugMessages();
      dawscript.enableDebugMessages();
   }

   document.addEventListener('gesturestart', (ev) => {
      ev.preventDefault();
   });

   render(createElement(RootComponent), document.body);
}

function RootComponent() {
   return H`
      <${SessionProvider}>
         <div
            className="size-app relative"
         >
            <${MainView}
               className="size-full"
            />
            <${OfflineView}
               className="size-full absolute inset-0"
            />
         </div>
      </${SessionProvider}>
   `;
}

main();
