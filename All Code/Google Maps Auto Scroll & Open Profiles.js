// ==UserScript==
// @name         Google Maps Auto Scroll & Open Profiles
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Auto scroll Google Maps, open business profiles, and close them after 7 seconds
// @author       Your Name
// @match        https://www.google.com/maps/*
// @grant        GM_openInTab
// ==/UserScript==

(function () {
    'use strict';

    let scrollCount = 0;
    let maxScrolls = 7; // Number of times to scroll down
    let scrollDelay = 2000; // Delay between each scroll (2 sec)
    let profileLinks = [];
    let currentIndex = 0;
    let tabCloseDelay = 7000; // Close tab after 7 seconds

    function autoScroll() {
        let scrollableDiv = document.querySelector('div[role="feed"]'); // Business list container
        if (scrollableDiv && scrollCount < maxScrolls) {
            console.log(`Scrolling down... (${scrollCount + 1}/${maxScrolls})`);
            scrollableDiv.scrollBy(0, 500); // Scroll down
            scrollCount++;
            setTimeout(autoScroll, scrollDelay); // Continue scrolling
        } else {
            console.log("Scrolling complete. Now collecting profile links...");
            setTimeout(collectProfiles, 2000); // Collect profiles after scrolling
        }
    }

    function collectProfiles() {
        let profileElements = document.querySelectorAll('a.hfpxzc'); // Business profile links
        profileLinks = [...new Set(Array.from(profileElements).map(el => el.href))]; // Remove duplicates
        console.log(`Found ${profileLinks.length} profiles.`);

        if (profileLinks.length > 0) {
            console.log("Scrolling back to the top...");
            document.querySelector('div[role="feed"]').scrollTo(0, 0); // Scroll back to the top
            setTimeout(openNextProfile, 3000); // Wait before opening profiles
        } else {
            console.warn("No profiles found!");
        }
    }

    function openNextProfile() {
        if (currentIndex < profileLinks.length) {
            let url = profileLinks[currentIndex];
            console.log(`Opening profile ${currentIndex + 1}/${profileLinks.length}: ${url}`);

            let newTab = GM_openInTab(url, { active: false, insert: true }); // Open in background tab
            setTimeout(() => {
                console.log(`Closing profile ${currentIndex + 1}`);
                newTab.close(); // Close tab after 7 seconds

                currentIndex++;
                setTimeout(openNextProfile, 2000); // Wait 2 sec before opening next
            }, tabCloseDelay);
        } else {
            console.log("All profiles opened and closed. Process complete.");
        }
    }

    console.log("Starting auto-scrolling...");
    setTimeout(autoScroll, 3000);
})();
