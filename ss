const express = require('express');
const { Client } = require('pg'); // PostgreSQL client
const app = express();

// PostgreSQL client setup (using Render's PostgreSQL credentials)
const client = new Client({
    user: 'your_db_user',  // Replace with your Render DB user
    host: 'your_db_host',  // Replace with your Render DB host
    database: 'your_db_name', // Replace with your database name
    password: 'your_db_password', // Replace with your DB password
    port: 5432, // Default PostgreSQL port
});

client.connect()
    .then(() => console.log("Connected to PostgreSQL database"))
    .catch(err => console.error("Error connecting to PostgreSQL database:", err));

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to check access based on allowed IPs in the database
const checkIpAccess = async (req, res, next) => {
    const CLIENT_IP = req.ip.replace('::ffff:', ''); // Normalize IPv4-mapped addresses
    const result = await client.query('SELECT * FROM allowed_ips WHERE ip_address = $1', [CLIENT_IP]);

    if (result.rows.length > 0) {
        next(); // IP is allowed, proceed to the next route
    } else {
        res.status(403).send('Forbidden'); // IP is not allowed
    }
};

// Route to add an IP to the allowed list in the database
app.post('/add-ip', async (req, res) => {
    const newIP = req.body.ip;
    if (!newIP) {
        return res.status(400).send('No IP provided.');
    }

    // Insert the IP into the database
    try {
        const result = await client.query('INSERT INTO allowed_ips (ip_address) VALUES ($1) RETURNING *', [newIP]);
        res.send(`IP ${newIP} added to allowed list.`);
    } catch (error) {
        if (error.code === '23505') {
            res.send(`IP ${newIP} is already allowed.`);
        } else {
            res.status(500).send('Error adding IP to database.');
        }
    }
});

// Route to list all allowed IPs from the database
app.get('/list-ips', async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM allowed_ips');
        res.json({ allowedIPs: result.rows.map(row => row.ip_address) });
    } catch (error) {
        res.status(500).send('Error fetching IPs from database.');
    }
});

// Route protected by IP middleware
app.get('/', checkIpAccess, (req, res) => {
    res.send(`Access granted to ${req.ip}`);
});

// Start the server
app.listen(3000, () => {
    console.log('Server running at port 3000');
});
