// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement, render, useEffect, useState }
   from './lib/preact+htm.js';
import NavigationView from './navigation.js';
import OfflineView from './offline.js';


function MainView() {
   const [isOnline, setOnline] = useState(false);

   useEffect(() => {
      dawscript.connect((status) => {
         setOnline(status);
         return true;
      });
   }, [setOnline]);

   return h`
      <${NavigationView} />
      <${OfflineView}
         isOnline=${isOnline}
      />
   `;
}


render(createElement(MainView), document.body);
