const express = require('express');
const app = express();
const port = 3003;

// Define the /getServer route
app.get('/getServer', (req, res) => {
    res.json({
        code: 200,
        server: 'localhost:3002'
    });
});

// Start the server
app.listen(port, () => {
    console.log(`DNS Server running on http://localhost:${port}`);
});
