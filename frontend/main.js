// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, render } from './lib/preact+htm.js';
import { TrackStrip } from './lib/widget.js';

await dawscript.connect();
const tracks = await dawscript.host.getTracks();

render(h`<${MainView} />`, document.body);


function MainView() {
   return h`
      <div className="flex flex-row gap-10 p-10">
         ${tracks.map(track => h`
            <${TrackStrip}
               key=${track.id}
               track=${track}
            />
         `)}
      </div>
   `;
}
