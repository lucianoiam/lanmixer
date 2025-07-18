// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement, render, useEffect, useState }
   from '/lib/preact+htm.js';
import { clearStateCache, enableStateCacheDebugMessages } from '/lib/cache.js';
import { useHostCall, useHostStateReadCountEffect } from '/lib/state.js';
import { ButtonComponent } from '/vendor/guinda/guinda.react.module.js';
import MixerView from './mixer.js';
import NavigationView from './navigation.js';
import OfflineView from '/lib/offline.js';

const { host, TrackType } = dawscript;


function MainView() {
   const [isOnline, setOnline] = useState(false);
   const [isReady, setReady] = useState(false);

   const tracks = useHostCall([], async () => {
      const audioTracks = [];

      for (const track of await host.getTracks()) {
         const type = await host.getTrackType(track);

         if (type == TrackType.AUDIO) {
            audioTracks.push(track);
         }
      }

      return audioTracks;
   });

   useEffect(() => {
      dawscript.connect((status) => {
         setOnline(status);

         if (! status) {
            clearStateCache();
         }

         return true;
      });
   }, [setOnline]);

   // UI is ready when reading at least tracks_len × [type+name+vol+mute] states
   useHostStateReadCountEffect((count) => {
      setReady((tracks.length > 0) && (count >= 4 * tracks.length));
   }, [tracks, setReady]);

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
