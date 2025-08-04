// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, createElement, render } from './lib/react.js';
import { enableCacheDebugMessages } from './lib/cache.js';
import { SessionProvider } from './lib/host.js';
import OfflineView from './lib/offline.js';
import MainView from './main.js';

function AppView() {
   return H`
      <${SessionProvider}>
         <div
            className="relative size-app"
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

function main() {
   const scriptSel = `script[src="${import.meta.url.split('/').pop()}"]`;

   if (document.querySelector(scriptSel).dataset.debugMessages === 'true') {
      enableCacheDebugMessages();
      dawscript.enableDebugMessages();
   }

   document.addEventListener('gesturestart', (ev) => {
      ev.preventDefault();
   });

   render(createElement(AppView), document.body);
}

main();
