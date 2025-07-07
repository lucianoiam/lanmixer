// SPDX-FileCopyrightText: 2025 Luciano Iam <oss@lucianoiam.com>
// SPDX-License-Identifier: MIT

import { h, createElement, render, useEffect, useState }
   from '/lib/preact+htm.js';
import { enableDebugMessages as cacheEnableDebugMessages} from '/lib/cache.js';
import { ButtonComponent } from '/vendor/guinda/guinda.react.module.js';
import MixerView from './mixer.js';
import NavigationView from './navigation.js';
import OfflineView from '/lib/offline.js';


function MainView() {
   const [isOnline, setOnline] = useState(false);

   useEffect(() => {
      dawscript.connect((status) => {
         setOnline(status);
         return true;
      });
   }, [setOnline]);

   return h`
      <div
         className="relative size-screen"
         style=${{
            minWidth: 512,
            minHeight: 384
         }}
      >
         <div
            className="absolute inset-0 flex flex-row"
         >
            <!--<$ {NavigationView}
               className="w-36"
            />-->
            <${MixerView} />
         </div>
         <${OfflineView}
            isOnline=${isOnline}
            className="absolute inset-0"
         />
      </div>
   `;
}


cacheEnableDebugMessages();
dawscript.enableDebugMessages();

render(createElement(MainView), document.body);
