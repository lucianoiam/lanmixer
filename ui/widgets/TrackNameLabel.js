// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { htm } from '../lib/react.js';
import { host } from '../lib/dawscript.module.js';
import { useObjectField } from '../lib/session.js';


export function TrackNameLabel({
   handle, className = '', style = {}
}) {
   const name = useObjectField('', handle, host.getTrackName);

   return htm`
      <span
         class="${className}"
         style="${style}"
      >
         ${name}
      </span>
   `;
}
