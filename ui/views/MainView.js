// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { htm, useState } from '../lib/react.js';
import { useAudioTracks } from '../lib/state.js';
import LoaderView from '../widgets/LoaderView.js';
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
      return htm`
         <${LoaderView}
            message="PROJECT"
            className="${className}"
            style="${style}"
         />`;
   }

   return htm`
      <div
         className="flex flex-row ${className}"
         style="${style}"
      >
         ${selectedTrack ? htm`
            <${TrackView}
               track=${selectedTrack}
            />
         `:htm`
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
