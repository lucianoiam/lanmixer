// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement as elem, render } from '/lib/react.js';
import { ConnectionProvider, useConnected, useMixerReady } from '/lib/state.js';
import MixerView from './mixer.js';
import NavigationView from './navigation.js';
import OfflineView from '/lib/offline.js';


function MainView() {
   const isConnected = useConnected();
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
            isConnected=${isConnected}
            className="absolute inset-0"
         />
      </div>
   `;
}


render(elem(ConnectionProvider, null, elem(MainView, null)), document.body);
