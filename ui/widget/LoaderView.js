// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { createElement } from '../lib/react.js';


const element = document.getElementById('loader').cloneNode(true);

export default function LoaderView({
   message,
   className = '',
   style = {}
}) {
   element.querySelector('span').textContent = message;

   const props = {
      dangerouslySetInnerHTML: { __html: element.outerHTML },
      className,
      style
   };

   return createElement('div', props);
}
