// ==UserScript==
// @name         Recompensas e Missões - GDB
// @namespace    http://gatodosbots.ptf
// @version      1.0
// @description  Gestão de construção de edificios
// @author       GatoDosBots
// @match        *://*.tribalwars.com.pt/game.php?village=*&screen=main
// @match        https://pt104.tribalwars.com.pt/game.php?village=8296&screen=place&mode=scavenge
// @grant        none
// @icon         https://i.ibb.co/ggspv9x/610163822dcbee0004cb2fc6.png
// ==/UserScript==
(function() {
    'use strict';

    // Function to claim rewards, complete missions, and close the popup
    function claimRewardsAndCompleteMissions() {
        // Check if the quest log is visible
        const questLog = document.getElementById('questlog_new');
        if (!questLog) return;

        // Open the rewards tab if there are rewards available
        const rewardBadge = document.getElementById('reward-system-badge');
        if (rewardBadge && parseInt(rewardBadge.textContent) > 0) {
            const rewardTab = document.querySelector('a[data-tab="reward-tab"]');
            if (rewardTab) {
                rewardTab.click();
            }
        }

        // Select all claim buttons for rewards
        const claimButtons = document.querySelectorAll('.reward-system-claim-button');

        // Loop through each button and click it if it's enabled
        let rewardsClaimed = false;
        claimButtons.forEach(button => {
            if (!button.disabled) {
                button.click();
                console.log('Claimed reward:', button.dataset.rewardId);
                rewardsClaimed = true; // Set flag to true if a reward was claimed
            }
        });

        // Select all complete mission buttons
        const completeButtons = document.querySelectorAll('.quest-complete-btn');

        // Loop through each complete button and click it if it's visible
        completeButtons.forEach(button => {
            if (button.offsetParent !== null) { // Check if the button is visible
                button.click();
                console.log('Completed mission:', button.closest('.quest').querySelector('.quest-link').textContent);
            }
        });

        // If no rewards were claimed, close the popup
        if (!rewardsClaimed) {
            const closeButton = document.querySelector('.popup_box_close');
            if (closeButton) {
                closeButton.click();
                console.log('Closed the rewards popup.');
            }
        }
    }

    // Run the claimRewardsAndCompleteMissions function every 5 seconds
    setInterval(claimRewardsAndCompleteMissions, 5000);
})();
