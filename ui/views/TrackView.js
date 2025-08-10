// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useRef, useState } from '../../lib/react.js';
import { useTrackPlugins } from '../lib/state-views.js';
import LoaderView from '../widgets/LoaderView.js';
import TrackStripView from './TrackStripView.js';
import PluginNavigation from './PluginNavigation.js';
import PluginView from './PluginView.js';


export default function TrackView({
   track,
   className = '',
   style = {}
}) {
   const plugins = useTrackPlugins(track);
   const [selectedPlugin, selectPlugin] = useState(null);
   const [isScrolling, setScrolling] = useState(false);
   const pluginListRef = useRef();
   
   // Default selection
   useEffect(() => {
      if (! plugins) {
         return;
      }
      selectPlugin(plugins[0]);
   }, [plugins]);
   
   // Nav → scroll
   useEffect(() => {
      if (! plugins || isScrolling) {
         return;
      }
      const index = plugins.indexOf(selectedPlugin);
      if (index >= 0) {
         const li = pluginListRef.current?.children[index];
         pluginListRef.current.parentNode.scrollTop = li.offsetTop;
      }
   }, [selectedPlugin]);

   // Scroll → nav
   useEffect(() => {
      if (! plugins || ! pluginListRef.current) {
         return;
      }

      const scrollParent = pluginListRef.current.parentNode;

      const listener = () => {
         const ul = pluginListRef.current;
         const parentRect = scrollParent.getBoundingClientRect();
         let maxVisibleHeight = 0;
         let selectedIndex = 0;

         for (let i = 0; i < ul.children.length; ++i) {
            const li = ul.children[i];
            const liRect = li.getBoundingClientRect();

            // Calculate visible height (overlap)
            const visibleTop = Math.max(liRect.top, parentRect.top);
            const visibleBottom = Math.min(liRect.bottom, parentRect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);

            if (visibleHeight > maxVisibleHeight) {
               maxVisibleHeight = visibleHeight;
               selectedIndex = i;
            }
         }

         setScrolling(true);
         selectPlugin(plugins[selectedIndex]);
      };

      scrollParent.addEventListener('scroll', listener, { passive: true });

      return () => {
         scrollParent.removeEventListener('scroll', listener);
      };
   }, [plugins]);

   useEffect(() => {
      if (! isScrolling) {
         return;
      }
      const tid = setTimeout(() => setScrolling(false), 100);
      return () => clearTimeout(tid);
   }, [isScrolling]);

   if (! plugins) {
      return H`
         <${LoaderView}
            message="PLUGINS"
            className="size-full ${className}"
            style="${style}"
         />`;
   }

   return H`
      <div
         className="flex flex-row size-full ${className}"
         style="${style}"
      >
         <${PluginNavigation}
            key=${track.handle}
            plugins=${plugins}
            className="pr-2"
            selection=${selectedPlugin}
            onSelect=${selectPlugin}
         />
         <div
            className="flex-1 flex flex-col items-center gap-2 overflow-auto"
         >
            <ul
               ref=${pluginListRef}
               className="contents"
            >
               ${plugins.map(plugin => H`
                  <li
                     key=${plugin.handle}
                  >
                     <${PluginView}
                        plugin=${plugin}
                        className="${plugin !== selectedPlugin ? 'opacity-25' : ''}"
                     />
                  </li>
               `)}
            </ul>
         </div>
         <${TrackStripView}
            track=${track}
            className="p-5 pl-0 w-24"
         />
      </div>
   `;
}
