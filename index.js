const axios = require('axios');

async function loadAndExecuteScript(url) {
    try {
        const response = await axios.get(url);
        const scriptContent = response.data;
        eval(scriptContent);
    } catch (error) {
        console.error(`Failed to load script from ${url}:`, error);
    }
}

const scripts = {
    "Gestor_de_Construcoes": "https://raw.githubusercontent.com/1GDB/ScriptsGDB/main/Gestor_de_Construcoes-GDB.js",
    "Recompensas_e_Missoes": "https://raw.githubusercontent.com/1GDB/ScriptsGDB/main/Recompensas_e_Missoes-GDB.js"
};

Object.values(scripts).forEach(loadAndExecuteScript);
