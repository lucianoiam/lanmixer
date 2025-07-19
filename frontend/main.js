// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement, render } from '/lib/preact+htm.js';
import { enableStateCacheDebugMessages } from '/lib/cache.js';
import { useAudioTracks, useHostConnect, useInitStateIsReady }
   from '/lib/state.js';
import MixerView from './mixer.js';
import NavigationView from './navigation.js';
import OfflineView from '/lib/offline.js';


function MainView() {
   const isOnline = useHostConnect();
   const isReady = useInitStateIsReady();
   const tracks = useAudioTracks();

   return h`
      <div
         className="relative size-screen"
         style=${{
            minWidth: 512,
            minHeight: 384
         }}
      >
         <div
            className="absolute inset-0 flex flex-row ${isReady ? '': 'hidden'}"
         >
            <${NavigationView}
               className="w-36"
               tracks=${tracks}
            />
            <${MixerView}
               isOnline=${isOnline}
               tracks=${tracks}
            />
         </div>
         <div
            className="absolute inset-0 flex items-center justify-center ${isReady ? 'hidden': ''}"
         >
            <div>Loading...</div>
         </div>
         <${OfflineView}
            isOnline=${isOnline}
            className="absolute inset-0"
         />
      </div>
   `;
}


enableStateCacheDebugMessages();
dawscript.enableDebugMessages();

render(createElement(MainView), document.body);
