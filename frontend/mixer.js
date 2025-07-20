// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useState } from '/lib/react.js';
import { useAudioTracks } from '/lib/state.js';
import { PluginsButton, TrackLabel, TrackStrip } from '/lib/widget.js';
import PluginsView from './plugins.js';


export default function MixerView() {
   const [pluginsViewTrack, setPluginsViewTrack] = useState(null);
   const tracks = useAudioTracks();

   return h`
      <div
         className="flex flex-col gap-5 w-full"
      >
         <div
            className="flex flex-row"
         >
            ${tracks.map(track => h`
               <div
                  key=${track}
                  className="flex flex-col gap-5 items-center"
                  style=${{
                     width: 120   
                  }}
               >
                  <${TrackLabel}
                     track=${track}
                  />
                  <${PluginsButton}
                     track=${track}
                     value=${track == pluginsViewTrack}
                     onClick=${setPluginsViewTrack}
                  />
                  ${pluginsViewTrack ? null : h`
                     <${TrackStrip}
                        track=${track}
                     />
                  `}
               </div>
            `)}
         </div>
         ${! pluginsViewTrack ? null : h`
            <${PluginsView}
               track=${pluginsViewTrack}
            />
         `}
      </div>
   `;
}
