// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useEffect, useState, useRef } from './preact+htm.js';


export default function OfflineView({
   isOnline,
   className
}) {
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

   className += isVisible ? ' block' : ' hidden';

   return h`
      <div
         class="bg-default bg-opacity-90 flex items-center justify-center ${className}"
      >
         <img
            src="static/offline.png"
            style=${{
               width: 96,
               height: 96
            }}
         />
      </div>
   `;
}
