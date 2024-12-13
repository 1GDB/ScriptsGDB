const express = require('express');
const app = express();

app.use(express.json()); // Middleware to parse JSON request bodies

// In-memory IP list (for testing purposes)
let allowedIPs = [];

// Middleware to check access
const checkIpAccess = (req, res, next) => {
    const CLIENT_IP = req.ip.replace('::ffff:', ''); // Normalize IPv4-mapped addresses
    if (allowedIPs.includes(CLIENT_IP)) {
        next();
    } else {
        res.status(403).send('Forbidden');
    }
};

// Route to add an IP to the allowed list
app.post('/add-ip', (req, res) => {
    const newIP = req.body.ip;
    if (!newIP) {
        return res.status(400).send('No IP provided.');
    }
    if (!allowedIPs.includes(newIP)) {
        allowedIPs.push(newIP);
        res.send(`IP ${newIP} added to allowed list.`);
    } else {
        res.send(`IP ${newIP} is already allowed.`);
    }
});

// Route to list all allowed IPs
app.get('/list-ips', (req, res) => {
    res.json({ allowedIPs });
});

// Route protected by IP middleware
app.get('/', checkIpAccess, (req, res) => {
    res.send(`Access granted to ${req.ip}`);
});

// Start the server
app.listen(3000, () => {
    console.log('Server running at port 3000');
});
