const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware для статических файлов
app.use(express.static(path.join(__dirname, 'public')));

app.use('/media', express.static(path.join(__dirname, 'media')));

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`SERVER LISTENING ON ${PORT}`);
});