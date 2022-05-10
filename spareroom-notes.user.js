// ==UserScript==
// @name         SpareRoom Notes
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add a custom note to each flatshare listing on SpareRoom.
// @author       Yuto Takano
// @match        https://www.spareroom.co.uk/flatshare/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=spareroom.co.uk
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';
    const params = (new URL(document.location)).searchParams;

    // If there is a specific flatshare this page references, use that.
    if (params.has("flatshare_id")) {
        const flatshare_id = params.get("flatshare_id");
        specificFlatshare(flatshare_id);
    } else {
        const listingPanels = document.getElementsByClassName("listing-result");
        Array.from(listingPanels).forEach((elem) => {
            let note = GM_getValue(elem.dataset.listingId, "");

            const div = document.createElement("div");
            div.innerHTML = note;

            div.style.width = "100%";
            div.style.position = "relative";
            div.style.whiteSpace = "pre-line";

            let headers = elem.getElementsByTagName("header");
            let lastHeader = headers[headers.length- 1];

            lastHeader.parentNode.insertBefore(
                div,
                lastHeader.nextSibling
            );
        });
    }
})();

function specificFlatshare(flatshare_id) {

    // Otherwise, get the stored memo (if any) for this flatshare:
    let note = GM_getValue(flatshare_id, "");

    const textarea = document.createElement("textarea");
    textarea.value = note;
    textarea.placeholder = "Start writing a personal note here..."

    // Copied from Send Message input class styles
    textarea.style.boxSizing = "border-box";
    textarea.style.width = "calc(100% - 32px)";
    textarea.style.boxShadow = "1px 1px 3px 0 rgb(0 0 0 / 50%)";
    textarea.style.borderRadius = "3px";
    textarea.style.padding = "10px";
    textarea.style.margin = "0 16px 0 16px";
    textarea.style.minHeight = "56px";

    const status = document.createElement("div");
    status.innerHTML = note ? "Loaded saved note." : "...";

    status.style.margin = "0 16px 20px";
    status.style.textAlign = "end";

    textarea.addEventListener("input", (e) => {
        status.innerHTML = "...";
        let elem = e.target;
        elem.style.height = "5px";
        elem.style.height = (elem.scrollHeight) + "px";
    });

    let typingTimer;
    let doneTypingInterval = 300;
    textarea.addEventListener("keyup", () => {
        clearTimeout(typingTimer);
        if (textarea.value) {
            typingTimer = setTimeout(() => {
                status.innerHTML = "Saving...";
                GM_setValue(flatshare_id, textarea.value);
                status.innerHTML = "Saved!";
            }, doneTypingInterval);
        }
    });

    document.getElementById("listing_header").parentNode.insertBefore(
        status,
        document.getElementById("listing_header").nextSibling
    );

    document.getElementById("listing_header").parentNode.insertBefore(
        textarea,
        status
    );
};
