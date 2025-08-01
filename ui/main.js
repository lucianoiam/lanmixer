// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useState } from './lib/react.js';
import { useSession } from './lib/state.js';
import { Loader } from './lib/widget.js';
import MixerView from './control/mixer.js';
import FullTrackView from './control/track.js';
import MainNavigationView from './navigation.js';


export default function MainView({ className }) {
   const [selectedTrack, setSelectedTrack] = useState(null);
   const { audioTracks, hasDetails } = useSession().mixer;

   if (! hasDetails) {
      return H`<${Loader}
         message="MIXER"
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
            className="w-48 overflow-auto"
            tracks=${audioTracks}
            selectedTrack=${selectedTrack}
            onChange=${setSelectedTrack}
         />
      </div>
   `;
}