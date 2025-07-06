// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h } from '/lib/preact+htm.js';
import { useEffectIfCacheEmpty, useStateWithCache } from '/lib/cache.js';

const { host, TrackType } = dawscript;


export default function PluginsView({
   track
}) {
   const stateKey = `${track}_plugins`;
   const [plugins, setPlugins] = useStateWithCache(stateKey, []);

   useEffectIfCacheEmpty(stateKey, async () => {
      setPlugins(await host.getTrackPlugins(track));
   }, [track]);

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
