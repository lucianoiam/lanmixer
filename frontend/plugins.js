// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h } from '/lib/preact+htm.js';
import { useHostCall } from '/lib/state.js';

const { host, TrackType } = dawscript;


export default function PluginsView({
   track
}) {
   const plugins = useHostCall([], host.getTrackPlugins, track);

   return h`
      <div
         className="text-center"
      >
         ${plugins.length > 0 ? plugins.map(plugin => h`
            <label>${JSON.stringify(plugin)}</label>
         `) : h`
            <label>No plugins</label>
         `}
      </div>
   `;
}
