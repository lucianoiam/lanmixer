// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useEffect, useState } from '/lib/preact+htm.js';
import { PluginsButton, TrackLabel, TrackStrip } from '/lib/widget.js';
import PluginsView from './plugins.js';

const { host, TrackType } = dawscript;


export default function MixerView() {
   const [tracks, setTracks] = useState([]);
   const [pluginsViewTrack, setPluginsViewTrack] = useState(null);

   useEffect(async () => {
      const audioTracks = [];

      for (const track of await host.getTracks()) {
         const type = await host.getTrackType(track);

         if (type == TrackType.AUDIO) {
            audioTracks.push(track);
         }
      }

      setTracks(audioTracks);
   }, [setTracks]);

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
