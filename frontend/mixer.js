// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useEffect, useState } from './lib/preact+htm.js';
import { TrackStrip } from './lib/widget.js';

const { host, TrackType } = dawscript;

export default function MixerView() {
   const [tracks, setTracks] = useState([]);

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
      <div className="flex flex-row">
         ${tracks.map(track => h`
            <${TrackStrip}
               key=${track}
               track=${track}
               style=${{
                  width: '120px'
               }}
            />
         `)}
      </div>
   `;
}
