// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement as elem, render } from '/lib/react.js';
import { ConnectionProvider, useAudioTracks, useMixerReady }
   from '/lib/host.js';
import { enableCacheDebugMessages } from '/lib/cache.js';
import MixerView from './mixer.js';
import NavigationView from './navigation.js';
import OfflineView from '/lib/offline.js';


function MainView() {
   const audioTracks = useAudioTracks();
   const isMixerReady = useMixerReady();

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

render(elem(ConnectionProvider, null, elem(MainView, null)), document.body);
