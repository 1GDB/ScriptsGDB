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

    const SERVER_URL = 'https://scriptsgdb.onrender.com';

    // Verify the key with the backend server
    async function verifyKey(key) {
        const response = await fetch(`${SERVER_URL}/verify-key?key=${key}`);
        const data = await response.json();
        return data.valid;
    }

    async function main() {
        const key = prompt('Enter your access key:');
        const isValid = await verifyKey(key);

        if (isValid) {
            alert('Key is valid! Script will run.');
            // Add your Tampermonkey functionality here
        } else {
            alert('Invalid key. Script will not run.');
        }
    }

    main();
})();
