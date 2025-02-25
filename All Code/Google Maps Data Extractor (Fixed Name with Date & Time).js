// ==UserScript==
// @name         Google Maps Data Extractor (Fixed Name with Date & Time)
// @namespace    https://your-namespace-here.com
// @version      1.6
// @description  Extracts business details from Google Maps and downloads JSON with a fixed filename and timestamp.
// @author       You
// @match        https://www.google.com/maps/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log("🚀 TamperMonkey Script Loaded");

    function cleanText(element) {
        return element ? element.innerText.replace(/\n/g, ' ').trim() : "N/A"; // Removes \n and trims spaces
    }

    function getCurrentFormattedDateTime() {
        const now = new Date();
        const options = {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        };

        let formattedDateTime = now.toLocaleString("en-US", options)
            .replace(/\//g, "-")  // Replace slashes with hyphens (02/19/2025 → 02-19-2025)
            .replace(/:/g, "-")    // Replace colons with hyphens (12:53:25 → 12-53-25)
            .replace(",", "");     // Remove comma between date and time

        return formattedDateTime;
    }

    function extractBusinessData() {
        console.log("🔍 Extracting Business Data...");

        // Get formatted date and time
        let formattedDateTime = getCurrentFormattedDateTime();

        // Create filename in the format: "Google Maps, MM-DD-YYYY, HH-MM-SS AM_PM.json"
        let fileName = `Google Maps, ${formattedDateTime}.json`;

        // Replace invalid filename characters
        fileName = fileName.replace(/[:<>"/\\|?*]/g, "_");

        // Business Name
        let businessNameElement = document.querySelector('h1');
        let businessName = cleanText(businessNameElement);

        // Website
        let websiteElement = document.querySelector('a[data-item-id="authority"]');
        let website = websiteElement ? websiteElement.href.trim() : "N/A";

        // Phone Number
        let phoneElement = document.querySelector('button[aria-label*="Phone"] div');
        let phoneNumber = cleanText(phoneElement);

        // Address
        let addressElement = document.querySelector('button[aria-label*="Address"] div');
        let address = cleanText(addressElement);

        console.log("✅ Cleaned & Extracted Data:", { businessName, website, phoneNumber, address });

        // Download JSON File Automatically
        let businessData = {
            name: businessName,
            website: website,
            phone: phoneNumber,
            address: address
        };

        let blob = new Blob([JSON.stringify(businessData, null, 2)], { type: "application/json" });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log(`📂 JSON File Downloaded Automatically as: ${fileName}`);
    }

    function observeDOMChanges() {
        console.log("👀 Setting up MutationObserver...");

        const targetNode = document.body;
        if (!targetNode) {
            console.error("❌ Target node not found.");
            return;
        }

        const config = { childList: true, subtree: true };

        const observer = new MutationObserver(() => {
            let businessNameElement = document.querySelector('h1');
            let websiteElement = document.querySelector('a[data-item-id="authority"]');
            let phoneElement = document.querySelector('button[aria-label*="Phone"] div');
            let addressElement = document.querySelector('button[aria-label*="Address"] div');

            if (businessNameElement || websiteElement || phoneElement || addressElement) {
                console.log("✅ Business Data Detected, Triggering Auto-Download...");
                observer.disconnect(); // Stop observing once detected
                extractBusinessData();
            }
        });

        observer.observe(targetNode, config);
    }

    // Run when page loads
    window.addEventListener("load", function () {
        console.log("✅ Window Loaded, Initializing...");
        setTimeout(() => {
            observeDOMChanges();
        }, 1000); // Delay set to 1 second (1000ms)
    });

})();
