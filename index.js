const axios = require('axios');
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');  // Set up local storage

async function loadAndExecuteScript(url) {
    try {
        const response = await axios.get(url);
        const scriptContent = response.data;
        eval(scriptContent);
    } catch (error) {
        console.error(`Failed to load script from ${url}:`, error);
    }
}
global.localStorage = new LocalStorage('./scratch');

const scripts = {
    "Gestor_de_Construcoes": "https://raw.githubusercontent.com/1GDB/ScriptsGDB/main/Gestor_de_Construcoes-GDB.js",
    "Recompensas_e_Missoes": "https://raw.githubusercontent.com/1GDB/ScriptsGDB/main/Recompensas_e_Missoes-GDB.js"
};

Object.values(scripts).forEach(loadAndExecuteScript);
