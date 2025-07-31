// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useState } from './lib/react.js';
import { useSession } from './lib/state.js';
import MixerView from './control/mixer.js';
import FullTrackView from './control/track.js';
import NavigationView from './navigation.js';


export default function MainView({ className }) {
   const [selectedTrack, setSelectedTrack] = useState(null);
   const { audioTracks, hasDetails } = useSession().mixer;

   if (! hasDetails) {
      return H`
         <div
            className="flex items-center justify-center ${className}"
         >
            <div>Loading mixer...</div>
         </div>
      `
   }

   return H`
      <div
         className="flex flex-row ${className}"
      >
         <${NavigationView}
            className="w-36 flex-shrink-0"
            tracks=${audioTracks}
            selectedTrack=${selectedTrack}
            onChange=${setSelectedTrack}
         />
         <div
            className="p-5"
         >
            ${selectedTrack ?H`
               <${FullTrackView}
                  track=${selectedTrack}
               />
            `:H`
               <${MixerView}
                  tracks=${audioTracks}
               />
            `}
         </div>
      </div>
   `;
}
