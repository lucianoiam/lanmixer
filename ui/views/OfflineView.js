// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useState, useRef } from '../lib/react.js';
import { useSession } from '../lib/state-host.js';


export default function OfflineView({
   className = '',
   style = {}
}) {
   const [isVisible, setVisible] = useState(false);
   const { isOnline } = useSession();
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

   return H`
      <div
         class="bg-black/75 flex items-center justify-center ${className}"
         style="${style}"
      >
         <img
            src="assets/offline.png"
            style=${{
               width: 96,
               height: 96
            }}
         />
      </div>
   `;
}
