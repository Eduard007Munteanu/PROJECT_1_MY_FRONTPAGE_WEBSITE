const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const backendBaseUrl = process.env.BACKEND_BASE_URL || 'http://localhost:8080';

app.get('/config.js', (req, res) => {
    res.type('application/javascript');
    res.send(
        `window.__APP_CONFIG__ = ${JSON.stringify({
            backendBaseUrl
        })};`
    );
});

app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.redirect('/html/Home.html');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
