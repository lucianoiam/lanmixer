// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement, render } from '/lib/react.js';
import { SessionProvider, useSession } from '/lib/host.js';
import { enableCacheDebugMessages } from '/lib/cache.js';
import MixerView from './mixer.js';
import NavigationView from './navigation.js';
import OfflineView from '/lib/offline.js';


function MainView() {
   const { audioTracks, isMixerReady } = useSession();

   return h`
      <div
         className="relative size-screen"
         style=${{
            minWidth: 512,
            minHeight: 384
         }}
      >
         ${isMixerReady ? h`
            <div
               className="absolute inset-0 flex flex-row"
            >
               <${NavigationView}
                  className="w-36"
                  tracks=${audioTracks}
               />
               <${MixerView}
                  tracks=${audioTracks}
               />
            </div>
         ` : h`
            <div
               className="absolute inset-0 flex items-center justify-center"
            >
               <div>Loading...</div>
            </div>
         `}
         <${OfflineView}
            className="absolute inset-0"
         />
      </div>
   `;
}


enableCacheDebugMessages();
dawscript.enableDebugMessages();

const mainView = createElement(MainView, null);
render(createElement(SessionProvider, null, mainView), document.body);
