// ==UserScript==
// @name        CHAVE
// @namespace    http://example.com/
// @version      1.0
// @description  Tampermonkey Script with Key Verification
// @author       GatoDosBots
// @match        *://*.tribalwars.com.pt/game.php?village=*&screen=main
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const GIST_URL = 'https://gist.githubusercontent.com/1GDB/4853a3a127b1253590a190a7c59818ff/raw/a6636b42934ef57a966c0caa2d759a386c7e570b/key'; // Replace with your Gist URL

    // Fetch the key from the Gist
    async function fetchKeyFromGist() {
        const response = await fetch(GIST_URL);
        const key = await response.text();  // Assuming the key is plain text in the Gist
        return key.trim(); // Remove any extra spaces/newlines
    }

    // Verify the key with the fetched key
    async function verifyKey(enteredKey) {
        const gistKey = await fetchKeyFromGist();  // Fetch the key from the Gist
        return enteredKey === gistKey;  // Check if the entered key matches the Gist key
    }

    async function main() {
        const enteredKey = prompt('Enter your access key:');
        const isValid = await verifyKey(enteredKey);

        if (isValid) {
            alert('Key is valid! Script will run.');
            // Add your Tampermonkey functionality here
        } else {
            alert('Invalid key. Script will not run.');
        }
    }

    main();
})();
