import { UserScript } from '../types';

export const defaultScriptTemplate = `// ==UserScript==
// @name         New Script
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  try to take over the world!
// @author       You
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    console.log('Hello from Tampermonkey!');
})();`;

export const sampleScripts: UserScript[] = [
  {
    id: 'script-1',
    name: 'YouTube Ad Blocker',
    enabled: true,
    code: `// ==UserScript==
// @name         YouTube Ad Blocker
// @namespace    http://tampermonkey.net/
// @version      2.1.0
// @description  Block ads on YouTube
// @author       YouTubeHelper
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// @icon         https://www.youtube.com/favicon.ico
// ==/UserScript==

(function() {
    'use strict';

    const adSelectors = [
        '.video-ads',
        '.ytp-ad-module',
        '#player-ads',
        '.ytp-ad-overlay-container',
        '.ytp-ad-text-overlay'
    ];

    function removeAds() {
        adSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        });
    }

    const observer = new MutationObserver(removeAds);
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[YouTube Ad Blocker] Initialized');
})();`,
    metadata: {
      name: 'YouTube Ad Blocker',
      namespace: 'http://tampermonkey.net/',
      version: '2.1.0',
      description: 'Block ads on YouTube',
      author: 'YouTubeHelper',
      match: ['https://www.youtube.com/*', 'https://youtube.com/*'],
      include: [],
      exclude: [],
      grant: ['GM_addStyle', 'GM_xmlhttpRequest'],
      runAt: 'document-start',
      icon: 'https://www.youtube.com/favicon.ico',
      updateURL: '',
      downloadURL: '',
      supportURL: '',
      homepageURL: '',
      license: '',
      noframes: false,
    },
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'script-2',
    name: 'Dark Mode Everywhere',
    enabled: true,
    code: `// ==UserScript==
// @name         Dark Mode Everywhere
// @namespace    http://tampermonkey.net/
// @version      1.5.2
// @description  Force dark mode on all websites
// @author       DarkModeMaster
// @match        *://*/*
// @exclude      *://*.google.com/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const darkCSS = \`
        html, body {
            background-color: #1a1a1a !important;
            color: #e0e0e0 !important;
        }
        * {
            background-color: transparent !important;
        }
        a {
            color: #4fc3f7 !important;
        }
    \`;

    GM_addStyle(darkCSS);
    console.log('[Dark Mode] Applied to', window.location.hostname);
})();`,
    metadata: {
      name: 'Dark Mode Everywhere',
      namespace: 'http://tampermonkey.net/',
      version: '1.5.2',
      description: 'Force dark mode on all websites',
      author: 'DarkModeMaster',
      match: ['*://*/*'],
      include: [],
      exclude: ['*://*.google.com/*'],
      grant: ['GM_addStyle', 'GM_setValue', 'GM_getValue'],
      runAt: 'document-start',
      icon: '',
      updateURL: '',
      downloadURL: '',
      supportURL: '',
      homepageURL: '',
      license: 'MIT',
      noframes: false,
    },
    createdAt: Date.now() - 86400000 * 10,
    updatedAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'script-3',
    name: 'Auto Clicker',
    enabled: false,
    code: `// ==UserScript==
// @name         Auto Clicker
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  Auto click elements on specified pages
// @author       ClickBot
// @match        https://example.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    function autoClick(selector, interval = 1000) {
        setInterval(() => {
            const el = document.querySelector(selector);
            if (el) el.click();
        }, interval);
    }

    // Auto click the confirm button
    autoClick('.confirm-btn', 2000);
})();`,
    metadata: {
      name: 'Auto Clicker',
      namespace: 'http://tampermonkey.net/',
      version: '1.0.3',
      description: 'Auto click elements on specified pages',
      author: 'ClickBot',
      match: ['https://example.com/*'],
      include: [],
      exclude: [],
      grant: ['none'],
      runAt: 'document-idle',
      icon: '',
      updateURL: '',
      downloadURL: '',
      supportURL: '',
      homepageURL: '',
      license: '',
      noframes: false,
    },
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'script-4',
    name: 'URL Redirector',
    enabled: true,
    code: `// ==UserScript==
// @name         URL Redirector
// @namespace    http://tampermonkey.net/
// @version      3.0.1
// @description  Redirect URLs to alternative frontends
// @author       RedirectMaster
// @match        https://twitter.com/*
// @match        https://x.com/*
// @match        https://reddit.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const redirects = {
        'twitter.com': 'nitter.net',
        'x.com': 'nitter.net',
        'reddit.com': 'libreddit.kavin.rocks'
    };

    const host = window.location.hostname.replace('www.', '');
    if (redirects[host]) {
        const newUrl = window.location.href.replace(host, redirects[host]);
        window.location.replace(newUrl);
    }
})();`,
    metadata: {
      name: 'URL Redirector',
      namespace: 'http://tampermonkey.net/',
      version: '3.0.1',
      description: 'Redirect URLs to alternative frontends',
      author: 'RedirectMaster',
      match: ['https://twitter.com/*', 'https://x.com/*', 'https://reddit.com/*'],
      include: [],
      exclude: [],
      grant: ['none'],
      runAt: 'document-start',
      icon: '',
      updateURL: '',
      downloadURL: '',
      supportURL: '',
      homepageURL: '',
      license: '',
      noframes: false,
    },
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now() - 86400000 * 5,
  },
];

export function generateId(): string {
  return 'script-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 9);
}

export function createNewScript(): UserScript {
  const now = Date.now();
  return {
    id: generateId(),
    name: 'New Script',
    enabled: true,
    code: defaultScriptTemplate,
    metadata: {
      name: 'New Script',
      namespace: 'http://tampermonkey.net/',
      version: '1.0',
      description: 'try to take over the world!',
      author: 'You',
      match: ['https://*/*'],
      include: [],
      exclude: [],
      grant: ['none'],
      runAt: 'document-end',
      icon: '',
      updateURL: '',
      downloadURL: '',
      supportURL: '',
      homepageURL: '',
      license: '',
      noframes: false,
    },
    createdAt: now,
    updatedAt: now,
  };
}
