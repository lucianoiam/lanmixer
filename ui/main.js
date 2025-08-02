// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useState } from './lib/react.js';
import { useAudioTracks } from './lib/state.js';
import { Loader } from './lib/widget.js';
import MixerView from './control/mixer.js';
import FullTrackView from './control/track.js';
import MainNavigationView from './navigation.js';

export default function MainView({ className }) {
   const [selectedTrack, selectTrack] = useState(null);
   const audioTracks = useAudioTracks();

   if (! audioTracks) {
      return H`
         <${Loader}
            message="MIXER"
            className="size-full"
         />`;
   }

   return H`
      <div
         className="flex flex-row ${className}"
      >
         <div
            className="flex-1 overflow-auto"
         >
            ${selectedTrack ? H`
               <${FullTrackView}
                  track=${selectedTrack}
               />
            ` : H`
               <${MixerView}
                  tracks=${audioTracks}
               />
            `}
         </div>
         <${MainNavigationView}
            className="w-40 overflow-auto"
            tracks=${audioTracks}
            selectedTrack=${selectedTrack}
            onChange=${selectTrack}
         />
      </div>
   `;
}