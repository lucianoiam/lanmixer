// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { host } from '../lib/dawscript.js';
import { useObjectField } from '../lib/state-host.js';


export function TrackNameLabel({
   handle, className = '', style = {}
}) {
   const name = useObjectField('', handle, host.getTrackName);

   return H`
      <span
         class="${className}"
         style="${style}"
      >
         ${name}
      </span>
   `;
}
