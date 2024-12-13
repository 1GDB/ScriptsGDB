const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve the Tampermonkey script
app.get('/tampermonkey-script.js', (req, res) => {
    res.sendFile(__dirname + '/Gestor_de_Construcoes-GDB.js');
});

// Example API endpoint for key verification
app.get('/verify-key', (req, res) => {
    const { key } = req.query;

    // Replace with your own key verification logic
    const isValid = key === '123';
    res.json({ valid: isValid });
});

// Default route for root path
app.get('/', (req, res) => {
    res.send('Welcome to the Tampermonkey API server!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
