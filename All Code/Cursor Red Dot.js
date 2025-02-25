// ==UserScript==
// @name         Facebook Profile Red Cursor
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Changes cursor to red when viewing Facebook profiles
// @author       YourName
// @match        https://www.facebook.com/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // Check if the URL matches a Facebook profile page
    const isProfilePage = () => {
        const path = window.location.pathname;
        // Match paths like "/username" or "/profile.php?id=123"
        return /^\/([\w\.]+)\/?$/.test(path) || /\/profile\.php\?id=\d+/.test(path);
    };

    // Apply red cursor only on profile pages
    const updateCursor = () => {
        if (isProfilePage()) {
            GM_addStyle(`
                body {
                    cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="red"/></svg>') 16 16, auto !important;
                }
            `);
        }
    };

    // Run on page load and when the URL changes (for SPAs like Facebook)
    updateCursor();
    window.addEventListener('popstate', updateCursor);
    window.addEventListener('pushstate', updateCursor);
})();
