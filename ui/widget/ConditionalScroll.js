// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { H, useEffect, useRef, useState } from '../lib/react.js';


// TODO: doesn't work with flex-1
export default function ConditionalScroll({
   children,
   justifyClass = 'justify-evenly',
   className = '',
   style = {}
}) {
   const ref = useRef();
   const [state, setState] = useState({ visible: false, scrolling: false });

   function measure() {
      const el = ref.current;
      if (!el) return { visible: false, scrolling: false };
      const visible = (el.clientWidth > 0) && (el.scrollWidth > 0);
      const scrolling = visible
        && (el.scrollWidth > el.clientWidth
            || el.scrollHeight > el.clientHeight);
      return { visible, scrolling };
   }

   useEffect(() => {
      setState(measure());
   }, [children]);

   const computedClassName = state.visible
        ? (state.scrolling
            ? 'overflow-auto'
            : justifyClass)
        : 'invisible';

   return H`
      <div
         ref=${ref}
         className="${computedClassName} ${className}"
         style=${style}
      >
         ${children}
      </div>
   `;
}
