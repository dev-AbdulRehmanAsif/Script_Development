// ==UserScript==
// @name         Auto Download JSON (No Email Restriction)
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  Extracts Facebook profile details and downloads JSON with a custom filename format including date and time.
// @author       You
// @match        *://www.facebook.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function isFacebookProfile() {
        return /^https:\/\/www\.facebook\.com\/[^/]+\/?$/.test(window.location.href);
    }

    function getProfileName() {
        let nameElement = document.querySelector('h1');
        return nameElement ? nameElement.innerText.trim() : "Unknown_Profile";
    }

    function getIntroDetails() {
        let introData = {
            profileName: getProfileName(),
            pageType: "Null",
            address: "Null",
            phone: "Null",
            email: "Null",
            website: "Null",
            status: "Null",
            rating: "Null"
        };

        let introSection = document.querySelector('div[class*="x1yztbdb"]');
        if (introSection) {
            let elements = introSection.querySelectorAll('span, div');

            elements.forEach(el => {
                let text = el.innerText.trim();

                if (text.includes("Page ·")) {
                    introData.pageType = text.replace("Page · ", "").trim();
                } else if (text.match(/\d{3,}/) && !text.includes("reviews")) {
                    introData.phone = text;
                } else if (text.includes("@")) {
                    introData.email = text;
                } else if (text.includes(".") && text.includes("com")) {
                    introData.website = text;
                } else if (text.includes("Always open") || text.includes("Closed")) {
                    introData.status = text;
                } else if (text.includes("reviews")) {
                    introData.rating = text;
                } else if (text.match(/\d+\s+\w+|\w+,\s+\w+/)) {
                    introData.address = text;
                }
            });
        }

        console.log("Extracted Intro Data:", introData);
        return introData;
    }

    function getFormattedDateTime() {
        let now = new Date();
        let day = now.getDate().toString().padStart(2, '0');
        let month = (now.getMonth() + 1).toString().padStart(2, '0');
        let year = now.getFullYear();

        let hours = now.getHours();
        let minutes = now.getMinutes().toString().padStart(2, '0');
        let seconds = now.getSeconds().toString().padStart(2, '0');

        let ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12; // Convert 24h to 12h format
        let formattedTime = `${hours}_${minutes} ${ampm} ${seconds} sec`;

        return `${month}_${day}_${year} ${formattedTime}`;
    }

    function downloadJSON() {
        let data = getIntroDetails();
        console.log("Final Extracted Data:", data);

        let jsonData = JSON.stringify(data, null, 4);
        let blob = new Blob([jsonData], { type: "application/json" });
        let url = URL.createObjectURL(blob);

        let platformName = "Facebook"; // Change this if you're modifying for other platforms
        let filename = `${platformName} ${getFormattedDateTime()}.json`;

        let a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function waitForProfileData() {
        const observer = new MutationObserver(() => {
            let data = getIntroDetails();
            if (data.profileName !== "Unknown_Profile") {
                observer.disconnect();
                downloadJSON();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    if (isFacebookProfile()) {
        waitForProfileData();
    }
})();
