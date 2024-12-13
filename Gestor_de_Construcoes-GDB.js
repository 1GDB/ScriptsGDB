// ==UserScript==
// @name         Gestor de Construções - GDB
// @namespace    http://gatodosbots.ptf
// @version      1.0
// @description  Gestão de construção de edificios
// @author       GatoDosBots
// @match        *://*.tribalwars.com.pt/game.php?village=*&screen=main
// @match        https://pt104.tribalwars.com.pt/game.php?village=8296&screen=place&mode=scavenge
// @grant        none
// @icon         https://i.ibb.co/ggspv9x/610163822dcbee0004cb2fc6.png
// ==/UserScript==

(async () => {
    'use strict';

    let constructionQueue = JSON.parse(localStorage.getItem('constructionQueue')) || [];
    let constructionLimit = parseInt(localStorage.getItem('constructionLimit')) || 1;
    let isProcessing = false;
    let controlPanel = null;

    // --- Helper functions for UI and actions ---
    function waitForElement(selector) {
        return new Promise(resolve => {
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    async function createUI() {
        await waitForElement("#content_value");

        const container = document.getElementById("content_value");
        if (!container) return;

        // Create the control panel
        controlPanel = document.createElement("div");
        controlPanel.style.border = "1px solid #8B5B29";
        controlPanel.style.padding = "10px";
        controlPanel.style.backgroundColor = "rgba(228, 207, 161, 0.8)";
        controlPanel.style.marginTop = "10px";
        controlPanel.style.fontFamily = "'Trebuchet MS', Arial, sans-serif";
        controlPanel.style.position = "absolute";
        controlPanel.style.zIndex = 1000;

        controlPanel.style.backgroundImage = 'url("https://i.ibb.co/6X7X6TJ/Medieval-Architecture-1024x512.jpg")';
        controlPanel.style.backgroundSize = 'cover';
        controlPanel.style.backgroundRepeat = 'no-repeat';
        controlPanel.style.backgroundPosition = 'center';

        controlPanel.innerHTML = `
            <div style="margin-bottom: 10px;">
                <label for="buildingSelect" style="font-weight: bold; color: white; font-size: 16px; text-shadow: 1px 1px 0px black;">Selecionar Edifício:</label>
                <select id="buildingSelect" style="padding: 5px; width: 200px;"></select>
                <label for="levelSelect" style="font-weight: bold; color: white; font-size: 16px; text-shadow: 1px 1px 0px black;">Nível:</label>
                <select id="levelSelect" style="padding: 5px; width: 60px;"></select>
                <button id="addBuilding" class="btn" style="margin-left: 5px;">Adicionar à lista</button>
                <button id="startConstruction" class="btn" style="margin-left: 5px;">Iniciar</button>
                <button id="stopConstruction" class="btn" style="margin-left: 5px;">Parar</button>
            </div>
            <div style="margin-bottom: 10px;">
                <label for="constructionLimit" style="font-weight: bold; color: white; font-size: 16px; text-shadow: 1px 1px 0px black;">Máximo de Construções Ativas:</label>
                <input type="number" id="constructionLimit" value="${constructionLimit}" min="1" max="5" style="padding: 5px; width: 60px;">
                                <button id="setLimit" class="btn" style="margin-left: 5px;">Definir Limite</button>
            </div>
            <div id="queueDisplay" style="margin-top: 10px; max-height: 200px; overflow-y: auto;">
                <strong style="color: white; font-size: 16px; text-shadow: 1px 1px 0px black;">Lista de Espera:</strong>
                <ul id="queueList" style="list-style-type: none; padding: 0;"></ul>
            </div>
        `;
        container.appendChild(controlPanel);

        // Make the control panel draggable
        makeDraggable(controlPanel);

        // Update building options and queue
        updateBuildingOptions();
        updateLevelOptions();
        updateQueueDisplay();

        // Event listeners for buttons
        document.getElementById('addBuilding').addEventListener('click', () => {
            const selectedBuilding = document.getElementById('buildingSelect').value;
            const selectedLevel = parseInt(document.getElementById('levelSelect').value);
            if (selectedBuilding) {
                addToQueue(selectedBuilding, selectedLevel);
            } else {
                console.log("Nenhum edifício selecionado.");
            }
        });

        document.getElementById('startConstruction').addEventListener('click', () => {
            if (!isProcessing) {
                console.log("Iniciando processo de construção...");
                isProcessing = true;
                processQueue();
                changeButtonState('startConstruction', false);
                changeButtonState('stopConstruction', true);
            }
        });

        document.getElementById('stopConstruction').addEventListener('click', () => {
            console.log("Parando processo de construção...");
            isProcessing = false;
            changeButtonState('startConstruction', true);
            changeButtonState('stopConstruction', false);
        });

        document.getElementById('setLimit').addEventListener('click', () => {
            const newLimit = parseInt(document.getElementById('constructionLimit').value);
            if (newLimit > 0) {
                constructionLimit = newLimit;
                localStorage.setItem('constructionLimit', constructionLimit);
                console.log(`Limite de construções definido para ${constructionLimit}`);
            }
        });
    }

    // --- Functions for construction queue management ---
    function addToQueue(buildingId, level) {
        const existingBuilding = constructionQueue.find(b => b.id === buildingId && b.level === level);
        if (!existingBuilding) {
            constructionQueue.push({ id: buildingId, level });
            localStorage.setItem('constructionQueue', JSON.stringify(constructionQueue));
            console.log(`Adicionado ${buildingId} (Level ${level}) à fila de construção.`);
            updateQueueDisplay();
        } else {
            console.log(`O edifício ${buildingId} já está na fila com nível ${level}.`);
        }
    }

    function removeFromQueue(buildingId, level) {
        constructionQueue = constructionQueue.filter(building => !(building.id === buildingId && building.level === level));
        localStorage.setItem('constructionQueue', JSON.stringify(constructionQueue));
        updateQueueDisplay();
        console.log(`Removido ${buildingId} (Level ${level}) da fila de construção.`);
    }

    function updateQueueDisplay() {
        const queueList = document.getElementById('queueList');
        queueList.innerHTML = '';
        constructionQueue.forEach(building => {
            const listItem = document.createElement('li');
            listItem.style.display = 'flex';
            listItem.style.justifyContent = 'space-between';
            listItem.style.alignItems = 'center';
            listItem.style.marginBottom = '5px';
            listItem.style.padding = '5px';
            listItem.style.border = '1px solid #8B5B29';
            listItem.style.borderRadius = '4px';
            listItem.style.backgroundColor = '#f9f9f9';

            // Create an image element for the building icon
            const buildingImage = document.createElement('img');
            buildingImage.src = `https://dsxs.innogamescdn.com/asset/4abb2a13/graphic/buildings/${building.id}.png`; // Update the URL as needed
            buildingImage.style.width = '16px';
            buildingImage.style.height = '16px';
            buildingImage.style.objectFit = 'contain';
            buildingImage.style.marginRight = '10px';

            // Append the image to the list item
            listItem.appendChild(buildingImage);

            // Add building text
            const buildingText = document.createElement('span');
                        buildingText.textContent = `${building.id} (Level ${building.level})`;
            listItem.appendChild(buildingText);

            // Create the remove button
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remover';
            removeButton.className = 'btn';
            removeButton.style.marginLeft = '10px';
            removeButton.onclick = () => removeFromQueue(building.id, building.level);

            listItem.appendChild(removeButton);
            queueList.appendChild(listItem);
        });
    }

    function updateBuildingOptions() {
        const buildingSelect = document.getElementById('buildingSelect');
        buildingSelect.innerHTML = '';

        const availableBuildings = [
            { id: "main", name: "Edifício Principal" },
            { id: "barracks", name: "Quartel" },
            { id: "stable", name: "Estábulo" },
            { id: "garage", name: "Oficina" },
            { id: "smith", name: "Ferreiro" },
            { id: "academy", name: "Academia" },
            { id: "market", name: "Mercado" },
            { id: "wood", name: "Bosque" },
            { id: "stone", name: "Poço de Argila" },
            { id: "iron", name: "Mina de Ferro" },
            { id: "farm", name: "Fazenda" },
            { id: "storage", name: "Armazém" },
            { id: "hide", name: "Esconderijo" },
            { id: "wall", name: "Muralha" }
        ];

        availableBuildings.forEach(building => {
            const option = document.createElement('option');
            option.value = building.id;
            option.textContent = building.name;
            buildingSelect.appendChild(option);
        });
    }

    function updateLevelOptions() {
        const levelSelect = document.getElementById('levelSelect');
        levelSelect.innerHTML = '';
        for (let i = 1; i <= 10; i++) { // Assuming a maximum of 10 levels
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Level ${i}`;
            levelSelect.appendChild(option);
        }
    }

    // --- Construction Queue Processing ---
    async function processQueue() {
        isProcessing = true;

        while (isProcessing) {
            let activeConstructs = await getActiveConstructions();
            if (activeConstructs >= constructionLimit) {
                console.log("Limite de construções ativas atingido.");
                await new Promise(resolve => setTimeout(resolve, 3000)); // Wait before checking again
                continue; // Check again for active constructions
            }

            for (let i = 0; i < constructionQueue.length; i++) {
                const building = constructionQueue[i];

                if (checkResources(building) && activeConstructs < constructionLimit) {
                    await addBuilding(building.id);
                    removeFromQueue(building.id, building.level);
                    activeConstructs++; // Increment active constructions count

                    const randomDelay = Math.floor(Math.random() * (12000 - 5000 + 1)) + 5000;
                    await new Promise(resolve => setTimeout(resolve, randomDelay));
                }
            }

            // If no active constructions, wait before checking again
            if (activeConstructs === 0) {
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }

        console.log("Fila de construção processada.");
        changeButtonState('startConstruction', true); // Enable start after processing
    }

    async function getActiveConstructions() {
        const activeConstructionRows = document.querySelectorAll('#buildqueue .lit');
        return activeConstructionRows.length; // Return the count of active constructions
    }

    async function addBuilding(buildingId) {
        const buildingLink = document.querySelector(`a.btn.btn-build[data-building="${buildingId}"]`);
        if (buildingLink) {
            const costs = getResourceCosts(buildingId);
            const resources = getAvailableResources();

            if (resources.wood < costs.wood || resources.stone < costs.stone || resources.iron < costs.iron) {
                alert("Recursos Insuficientes!");
                console.log(`Não há recursos suficientes para construir ${buildingId}.`);
                return;
            }

            buildingLink.click();
            console.log(`Iniciando construção para ${buildingId}...`);
            await waitForConstruction();
        }
    }

        function waitForConstruction() {
        return new Promise(resolve => {
            const observer = new MutationObserver(() => {
                if (window.location.href.includes("game.php")) {
                    observer.disconnect();
                    resolve();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    function checkResources(building) {
        const costs = getResourceCosts(building.id);
        const resources = getAvailableResources();

        return resources.wood >= costs.wood && resources.stone >= costs.stone && resources.iron >= costs.iron;
    }

    function getResourceCosts(buildingId) {
        const costs = {};
        const woodCostElement = document.querySelector(`tr[data-building="${buildingId}"] .cost_wood`);
        const stoneCostElement = document.querySelector(`tr[data-building="${buildingId}"] .cost_stone`);
        const ironCostElement = document.querySelector(`tr[data-building="${buildingId}"] .cost_iron`);

        costs.wood = woodCostElement ? parseInt(woodCostElement.textContent.replace(/\D/g, '')) : 0;
        costs.stone = stoneCostElement ? parseInt(stoneCostElement.textContent.replace(/\D/g, '')) : 0;
        costs.iron = ironCostElement ? parseInt(ironCostElement.textContent.replace(/\D/g, '')) : 0;

        return costs;
    }

    function getAvailableResources() {
        let wood = 0, stone = 0, iron = 0;

        const resourceElements = document.querySelectorAll(".resource");
        resourceElements.forEach(el => {
            const resourceName = el.getAttribute("data-resource");
            const resourceAmount = parseInt(el.textContent.replace(/\D/g, ''));

            if (resourceName === "wood") wood = resourceAmount;
            if (resourceName === "stone") stone = resourceAmount;
            if (resourceName === "iron") iron = resourceAmount;
        });

        return { wood, stone, iron };
    }

    function changeButtonState(buttonId, isEnabled) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.disabled = !isEnabled;
        }
    }

    // Make the control panel draggable
    function makeDraggable(element) {
        let offsetX, offsetY;

        element.addEventListener('mousedown', (e) => {
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            element.style.left = `${e.clientX - offsetX}px`;
            element.style.top = `${e.clientY - offsetY}px`;
            element.style.position = 'absolute';
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    // Start the UI creation and UI visibility maintenance
    document.addEventListener("DOMContentLoaded", () => {
        createUI();
        observeBuildQueue();
        keepUIVisible();
    });

    // ** New feature **: Observe the build queue for changes
    function observeBuildQueue() {
        const queueObserver = new MutationObserver(() => {
            const activeQueueCount = document.querySelectorAll("#buildqueue .lit").length;
            console.log(`Número de construções ativas: ${activeQueueCount}`);
            if (activeQueueCount === 0) {
                // Auto-click stop and start buttons again if all constructions are removed
                document.getElementById("stopConstruction").click();
                setTimeout(() => document.getElementById("startConstruction").click(), 1000);
            }
        });

        // Observe changes in the build queue area
        const buildQueue = document.querySelector("#buildqueue");
        if (buildQueue) {
            queueObserver.observe(buildQueue, { childList: true, subtree: true });
        }
    }

    // ** New feature **: Ensure UI remains visible even if page is dynamically updated
    function keepUIVisible() {
        const uiObserver = new MutationObserver(() => {
            if (!document.body.contains(controlPanel)) {
                document.body.appendChild(controlPanel);
            }
        });

        uiObserver.observe(document.body, { childList: true, subtree: true });
    }
})();
