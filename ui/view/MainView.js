// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useState } from '../lib/react.js';
import { useAudioTracks } from '../lib/view-state.js';
import LoaderView from '../widget/LoaderView.js';
import MixerView from './MixerView.js';
import TrackView from './TrackView.js';
import MainNavigationView from './MainNavigation.js';


export default function MainView({
   className = '',
   style = {}
}) {
   const [selectedTrack, selectTrack] = useState(null);
   const audioTracks = useAudioTracks();

   if (! audioTracks) {
      return H`
         <${LoaderView}
            message="MIXER"
            className="${className}"
            style="${style}"
         />`;
   }

   return H`
      <div
         className="flex flex-row ${className}"
         style="${style}"
      >
         ${selectedTrack ? H`
            <${TrackView}
               track=${selectedTrack}
            />
         ` : H`
            <${MixerView}
               className="p-5"
               tracks=${audioTracks}
            />
         `}
         <${MainNavigationView}
            className="pl-2 shrink-0"
            tracks=${audioTracks}
            selectedTrack=${selectedTrack}
            onChange=${selectTrack}
         />
      </div>
   `;
}
