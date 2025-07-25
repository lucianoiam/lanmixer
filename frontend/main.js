// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, createElement, render, useState } from './lib/react.js';
import { SessionProvider, useSession } from './lib/state.js';
import { enableCacheDebugMessages } from './lib/cache.js';
import MixerView from './mixer.js';
import NavigationView from './navigation.js';
import OfflineView from './lib/offline.js';
import TrackView from './track.js';


function MainView() {
   const [selectedTrack, setSelectedTrack] = useState(null);
   const { mixer } = useSession();

   return H`
      <div
         className="relative size-screen"
         style=${{
            minWidth: 512,
            minHeight: 384
         }}
      >
         ${mixer.hasDetails ?H`
            <div
               className="absolute inset-0 flex flex-row"
            >
               <${NavigationView}
                  className="w-36 flex-shrink-0"
                  tracks=${mixer.audioTracks}
                  selectedTrack=${selectedTrack}
                  onChange=${setSelectedTrack}
               />
               <div
                  className="p-5"
               >
                  ${selectedTrack ?H`
                     <${TrackView}
                        track=${selectedTrack}
                     />
                  `:H`
                     <${MixerView}
                        tracks=${mixer.audioTracks}
                     />
                  `}
               </div>
            </div>
         `:H`
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

const mainView = createElement(MainView);
render(createElement(SessionProvider, null, mainView), document.body);
