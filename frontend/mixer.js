// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement, useEffect, useState } from '/lib/preact+htm.js';
import { FXButton, TrackLabel, TrackStrip } from '/lib/widget.js';
const { host, TrackType } = dawscript;


export default function MixerView({
   className
}) {
   const [tracks, setTracks] = useState([]);
   const [showFX, setShowFX] = useState(false);

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

   const onFXClick = (track, value) => {
      setShowFX(value); // TODO
   };

   return h`
      <div
         className="flex flex-col gap-5 ${className}"
      >
         <div
            className="flex flex-row"
         >
            ${tracks.map(track => h`
               <div
                  className="flex flex-col gap-5 items-center"
                  style=${{
                     width: 120   
                  }}
               >
                  <${TrackLabel}
                     track=${track}
                  />
                  <${FXButton}
                     track=${track}
                     onClick=${onFXClick}
                  />
                  ${showFX ? null : h`
                     <${TrackStrip}
                        track=${track}
                     />
                  `}
               </div>
            `)}
         </div>
         ${! showFX ? null : h`
            <div
               className="w-full text-center"
            >
               TODO: FX
            </div>
         `}
      </div>
   `;
}
