const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;


//app.use('/Chapter_18', express.static(path.join(__dirname, 'JavaScriptExercises', 'Chapter_18')));

app.use(express.static(__dirname));  //Unsafe, fix later when publicly distributed. 

// Route to serve exercise.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/html/CV.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});