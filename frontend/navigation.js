// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useEffect, useState }
   from './lib/preact+htm.js';
import MixerView from './mixer.js';


export default function NavigationView() {
   return h`
      <div class="h-screen-safe w-screen absolute">
         <${MixerView} />
      </div>
   `;
}
