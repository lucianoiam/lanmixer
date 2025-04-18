// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, render, useEffect, useState } from './lib/preact+htm.js';
import { TrackStrip } from './lib/widget.js';


await dawscript.connect();

render(h`<${MainView} />`, document.body);


function MainView() {
   return h`
      <div className="w-full p-5">
         <${MixerView} />
      </div>
   `;
}


function MixerView() {
   const [tracks, setTracks] = useState([]);

   useEffect(async () => {
      setTracks(await dawscript.host.getTracks());
   }, [setTracks]);

   return h`
      <div className="flex flex-row w-full">
         ${tracks.map(track => h`
            <${TrackStrip}
               key=${track.id}
               track=${track}
               className="flex-1"
            />
         `)}
      </div>
   `;
}
