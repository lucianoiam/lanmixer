// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { html, render } from './lib/preact+htm.js';
import { TrackStrip } from './lib/widget.js';

await dawscript.connect();
const tracks = await dawscript.host.getTracks();

render(html`<${MainView} />`, document.body);


function MainView() {
   return html`
       <div style="display: flex; gap: 2em">
         ${tracks.map(track =>
           html`<${TrackStrip} key=${track.id} track=${track} />`
         )}
       </div>
   `;
}
