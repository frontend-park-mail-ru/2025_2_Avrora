const API_CONFIG = require("./public/config.js").API_CONFIG;
const express = require("express");
const path = require("path");

/**
 * Express сервер для SPA приложения Homa
 * @module server
 */
const app = express();
const PORT = 3000;

/**
 * Middleware для обработки CORS
 */
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", API_CONFIG.API_BASE_URL);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    
    next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

/**
 * Обработчик всех GET запросов для SPA
 * @name get/*
 * @function
 * @param {Object} req - Объект запроса
 * @param {Object} res - Объект ответа
 */
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Запускает сервер на указанном порту
 */
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});