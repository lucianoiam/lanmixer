// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement, render } from '/lib/react.js';
import { enableCacheDebugMessages } from '/lib/cache.js';
import { useHostConnect, useMixerStateIsReady } from '/lib/state.js';
import MixerView from './mixer.js';
import NavigationView from './navigation.js';
import OfflineView from '/lib/offline.js';


function MainView() {
   const isOnline = useHostConnect();
   const isReady = useMixerStateIsReady();

   return h`
      <div
         className="relative size-screen"
         style=${{
            minWidth: 512,
            minHeight: 384
         }}
      >
         ${isReady ? h`
            <div
               className="absolute inset-0 flex flex-row"
            >
               <${NavigationView}
                  className="w-36"
               />
               <${MixerView} />
            </div>
         ` : h`
            <div
               className="absolute inset-0 flex items-center justify-center"
            >
               <div>Loading...</div>
            </div>
         `}
         <${OfflineView}
            isOnline=${isOnline}
            className="absolute inset-0"
         />
      </div>
   `;
}


enableCacheDebugMessages();
dawscript.enableDebugMessages();

render(createElement(MainView), document.body);
