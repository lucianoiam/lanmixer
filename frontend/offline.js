// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useEffect, useState, useRef } from './lib/preact+htm.js';
import MixerView from './mixer.js';


export default function OfflineView({ isOnline }) {
   const [isVisible, setVisible] = useState(false);
   const timer = useRef(null);

   useEffect(() => {
      clearTimeout(timer.current);

      if (isOnline) {
         setVisible(false);
      } else {
         timer.current = setTimeout(() => {
            setVisible(true);
         }, 1000);
      }

      return () => clearTimeout(timer.current);
   }, [isOnline]);

   const className = isVisible ? 'block' : 'hidden';

   return h`
      <div class="${className} h-screen-safe w-screen absolute bg-default bg-opacity-90 flex items-center justify-center">
         <img
            src="static/offline.png"
            style=${{
               width: '96px',
               height: '96px'
            }}
         />
      </div>
   `;
}
