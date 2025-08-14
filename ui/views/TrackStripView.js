// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { ListenerTrackPanKnob, ListenerTrackVolumeFader, ListenerTrackMuteButton } from '../widgets/ListenerWidget.js';
import { TrackNameLabel } from '../widgets/TrackNameLabel.js';


export default function TrackStripView({
   track,
   className = '',
   style = {}
}) {
   return H`
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
         <${ListenerTrackVolumeFader}
            handle=${track.handle}
            className="flex-1"
         />
         <${ListenerTrackMuteButton}
            handle=${track.handle}
         >
            <span>M</span>
         </${ListenerTrackMuteButton}>
         <div
            className="h-[6%]"
         />
      </div>
   `;
}
