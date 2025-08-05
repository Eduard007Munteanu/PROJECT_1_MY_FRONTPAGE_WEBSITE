const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// ✅ No 'frontEnd' here — you're already in it
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'CV.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
