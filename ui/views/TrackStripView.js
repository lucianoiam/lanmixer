// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { htm } from '../lib/react.js';
import { useSession } from '../lib/session.js';
import { ListenerTrackPanKnob, ListenerTrackVolumeFader,
         ListenerTrackMuteButton } from '../widgets/ListenerWidget.js';
import { TrackNameLabel } from '../widgets/TrackNameLabel.js';


export default function TrackStripView({
   track,
   className = '',
   style = {}
}) {
   return htm`
      <div
         className="flex flex-col items-center gap-10 h-full ${className}"
         style="${style}"
      >
         <${TrackNameLabel}
            handle=${track.handle}
         />
         <${ListenerTrackPanKnob}
            handle=${track.handle}
         />
         <${VolumeFader}
            track=${track}
            className="flex-1"
         />
         <${MuteButton}
            track=${track}
         />
         <div
            className="h-[6%]"
         />
      </div>
   `;
}

function VolumeFader({ track, className = '', style = {} }) {
   const scale = useSession().volumeScale;
   const formatDb = (v) => {
      if (v === -Infinity) return '-∞';
      const n = parseFloat(v);
      return n > 0 ? '+' + n : '' + n;
   };
   const entries = Object.entries(scale)
      .map(([k, v]) => ({ y: parseFloat(k), val: formatDb(v) }))
      .sort((a, b) => a.y - b.y);

   return htm`
      <div
         className="flex flex-row h-full gap-2 w-20 ${className}"
         style=${style}
      >
         <div className="relative w-4">
            ${entries.map(e => htm`
               <div
                  key=${'line-' + e.y}
                  className="absolute right-0 translate-y-1/2"
                  style=${{ bottom: (e.y * 100) + '%' }}
               >
                  <div className="h-px w-${e.val == 0 ? '4' : '2'} bg-neutral-500" />
               </div>
            `)}
         </div>
         <${ListenerTrackVolumeFader}
            handle=${track.handle}
         />
         <div className="relative w-4">
            ${entries.map(e => htm`
               <div
                  key=${'val-' + e.y}
                  className="absolute left-0 right-0 translate-y-1/2"
                  style=${{ bottom: (e.y * 100) + '%' }}
               >
                  <span className="block text-[10px] text-right text-neutral-500 tabular-nums">${e.val}</span>
               </div>
            `)}
         </div>
      </div>
   `;
}

function MuteButton({ track, className = '', style = {} }) {
   return htm`
      <${ListenerTrackMuteButton}
         handle=${track.handle}
         className=${className}
         style=${style}
      >
         <span>M</span>
      </${ListenerTrackMuteButton}>
   `;
}
