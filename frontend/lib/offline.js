// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, useEffect, useState, useRef } from './react.js';
import { useConnected } from '/lib/host.js';


export default function OfflineView({ className }) {
   const [isVisible, setVisible] = useState(false);
   const isConnected = useConnected();
   const timer = useRef(null);

   useEffect(() => {
      clearTimeout(timer.current);

      if (isConnected) {
         setVisible(false);
      } else {
         timer.current = setTimeout(() => {
            setVisible(true);
         }, 1000);
      }

      return () => clearTimeout(timer.current);
   }, [isConnected]);

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
