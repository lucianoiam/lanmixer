// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useState } from '../lib/react.js';
import { useAudioTracks } from '../lib/view-state.js';
import LoaderView from '../widget/LoaderView.js';
import MixerView from './control/MixerView.js';
import TrackFullView from './control/TrackFullView.js';
import MainNavigationView from './MainNavigation.js';


export default function MainView({ className }) {
   const [selectedTrack, selectTrack] = useState(null);
   const audioTracks = useAudioTracks();

   if (! audioTracks) {
      return H`
         <${LoaderView}
            message="MIXER"
            className="size-full"
         />`;
   }

   return H`
      <div
         className="flex flex-row ${className}"
      >
         ${selectedTrack ? H`
            <${TrackFullView}
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