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
         ${selectedTrack ? H`
            <${FullTrackView}
               track=${selectedTrack}
            />
         ` : H`
            <${MixerView}
               className="p-5"
               tracks=${audioTracks}
            />
         `}
         <${MainNavigationView}
            className="w-42 pl-2"
            tracks=${audioTracks}
            selectedTrack=${selectedTrack}
            onChange=${selectTrack}
         />
      </div>
   `;
}