// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H } from '../lib/react.js';
import { PluginView } from './plugin.js';
import { useEffect, useRef, useState } from '../lib/react.js';
import { NavigationButton } from '../navigation.js';
import { TrackMuteButton, TrackNameLabel, TrackPanKnob, TrackVolumeFader,
         Loader }
   from '../lib/widget.js';
import { usePlugins, usePluginNames } from '../lib/state.js';

export default function FullTrackView({ track, className }) {
   const [selectedPlugin, selectPlugin] = useState(null);

   useEffect(() => {
      selectPlugin(track.pluginHandles[0]);
   }, [track]);

   return H`
      <div
         className="flex flex-row h-full ${className}"
      >
         <${PluginNavigation}
            key=${track.handle}
            handles=${track.pluginHandles}
            selection=${selectedPlugin}
            onSelect=${selectPlugin}
         />
         <${TrackPluginsView}
            handles=${track.pluginHandles}
            focus=${selectedPlugin}
         />
         <div className="flex items-center">
            <${TrackStrip}
               track=${track}
               className="p-5 shrink-0"
            />
         </div>
      </div>
   `;
}

export function TrackStrip({ track, className }) {
   return H`
      <div
         className="flex flex-col items-center gap-10 h-full w-36 ${className}"
      >
         <${TrackNameLabel}
            handle=${track.handle}
         />
         <${TrackPanKnob}
            handle=${track.handle}
         />
         <${TrackVolumeFader}
            handle=${track.handle}
            className="flex-1"
         />
         <${TrackMuteButton}
            handle=${track.handle}
         />
         <div
            className="h-[6%]"
         />
      </div>
   `;
}

function PluginNavigation({ handles, selection, onSelect }) {
   const names = usePluginNames(handles);
   const ulRef = useRef();
   const [isOverflowing, setIsOverflowing] = useState(false);

   useEffect(() => {
      if (handles.length > 0 && selection == null) {
         onSelect(handles[0]);
      }
   }, [handles, selection, onSelect]);

   useEffect(() => {
      const ul = ulRef.current;
      if (!ul) return;
      // Check if content overflows
      setIsOverflowing(ul.scrollHeight > ul.clientHeight);
   }, [names]);

   return H`
   <ul
      ref=${ulRef}
      className="flex flex-col w-42 shrink-0 gap-2 pr-2 ${isOverflowing ? 'overflow-auto' : 'justify-center'}"
   >
      ${names.map((name, i) => H`
         <li
            key=${handles[i]}
         >
            <${NavigationButton}
               target=${handles[i]}
               isSelected=${selection == handles[i]}
               onClick=${() => onSelect(handles[i])}
            >
               <span>${name}</span>
            </${NavigationButton}>
         </li>
      `)}
   </ul>
   `;
}

function TrackPluginsView({ handles, focus }) {
   const plugins = usePlugins(handles);
   const listRef = useRef();

   useEffect(() => {
      if (!focus || !listRef.current) return;
      const index = handles.indexOf(focus);
      if (index >= 0) {
         const list = listRef.current;
         const item = list.children[index];
         if (item) {
            list.scrollTo({ top: item.offsetTop, behavior: 'smooth' });
         }
      }
   }, [focus, handles]);

   if (! plugins) {
      return H`<${Loader}
         message="PLUGINS"
         className="size-full"
      />`;
   }

   return H`
   <ul
      ref=${listRef}
      className="flex-1 flex flex-col items-center gap-2 overflow-auto"
   >
      ${plugins.map(plugin => H`
         <li
            key=${plugin.handle}
            className="flex flex-row"
         >
            <${PluginView}
               plugin=${plugin}
            />
            <!-- Push scrollbar to the right -->
            <div
               className="flex-1"
            >
            </div>
         </li>
      `)}
   </ul>`;
}
