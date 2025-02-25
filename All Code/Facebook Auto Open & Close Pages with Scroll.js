// ==UserScript==
// @name         Facebook Auto Open & Close Pages with Scroll (Fixed)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Scrolls down, extracts all visible page links, opens them for 5 seconds, then closes them.
// @author       You
// @match        *://www.facebook.com/search/pages/*
// @grant        GM_openInTab
// ==/UserScript==

(function() {
    'use strict';

    let scrollCount = 0;
    const maxScrolls = 20;
    const scrollDelay = 2000; // 2 sec between scrolls
    let pageLinks = [];
    let currentIndex = 0;
    const waitTime = 5000; // 5 seconds on each profile

    console.log("[Tampermonkey] Script started!");

    function autoScroll() {
        if (scrollCount < maxScrolls) {
            window.scrollBy(0, window.innerHeight); // Scroll down
            scrollCount++;
            console.log(`[Tampermonkey] Scrolling... (${scrollCount}/${maxScrolls})`);
            setTimeout(autoScroll, scrollDelay);
        } else {
            console.log("[Tampermonkey] Scrolling completed. Going back to the top...");
            setTimeout(scrollToTop, 2000);
        }
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log("[Tampermonkey] Returned to the top. Extracting page links in 3 seconds...");
        setTimeout(extractPageLinks, 3000);
    }

    function extractPageLinks() {
        let results = document.querySelectorAll('[role="article"]'); // Try to grab all search results

        results.forEach(result => {
            let linkElement = result.querySelector('a[href^="https://www.facebook.com/"]'); // Find the first valid link inside each result

            if (linkElement) {
                let url = linkElement.href.split('?')[0]; // Get the clean URL without tracking parameters
                if (!pageLinks.includes(url)) {
                    pageLinks.push(url);
                }
            }
        });

        console.log(`[Tampermonkey] Found ${pageLinks.length} pages.`);
        if (pageLinks.length > 0) {
            openNextPage();
        } else {
            console.log("[Tampermonkey] No links found! Try refreshing the page.");
        }
    }

    function openNextPage() {
        if (currentIndex < pageLinks.length) {
            let pageUrl = pageLinks[currentIndex];
            console.log(`[Tampermonkey] Opening page (${currentIndex + 1}/${pageLinks.length}): ${pageUrl}`);

            let newTab = GM_openInTab(pageUrl, { active: true, insert: true });

            setTimeout(() => {
                newTab.close();
                console.log(`[Tampermonkey] Closed page: ${pageUrl}`);
                currentIndex++;
                setTimeout(openNextPage, 2000);
            }, waitTime);

        } else {
            console.log("[Tampermonkey] All pages visited! Script completed.");
        }
    }

    window.addEventListener('load', function() {
        console.log("[Tampermonkey] Page loaded. Starting auto-scroll in 3 seconds...");
        setTimeout(autoScroll, 3000);
    });

})();
