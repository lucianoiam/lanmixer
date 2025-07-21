// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h } from '/lib/react.js';
import { useImmutableState } from '/lib/host.js';

const { host, TrackType } = dawscript;


export default function PluginsView({
   track
}) {
   const plugins = useImmutableState([], track, host.getTrackPlugins);

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
