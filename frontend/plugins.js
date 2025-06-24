// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useEffect, useState } from '/lib/preact+htm.js';

const { host, TrackType } = dawscript;


export default function PluginsView({
   track
}) {
   const [plugins, setPlugins] = useState([]);

   useEffect(async () => {
      setPlugins(await host.getTrackPlugins(track));
   }, [track, setPlugins,]);

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
