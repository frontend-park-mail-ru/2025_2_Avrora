import { readFile } from 'fs/promises';
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_CONFIG = JSON.parse(await readFile(new URL('./public/config.json', import.meta.url), 'utf-8'));

const app = express();
const PORT = process.env.PORT || 8000;

const isProduction = process.env.NODE_ENV === 'production';

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", isProduction
        ? API_CONFIG.API_BASE_URL
        : "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

app.use(express.json());

app.use('/sw.js', (req, res, next) => {
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

if (isProduction) {
    app.use(express.static(path.join(__dirname, 'dist'), {
        setHeaders: (res, path) => {
            if (path.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            }
            else if (path.endsWith('.js') || path.endsWith('.css')) {
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            }
            else {
                res.setHeader('Cache-Control', 'public, max-age=86400');
            }
        }
    }));

    app.get('*', (req, res) => {
        if (req.path === '/sw.js') {
            res.setHeader('Service-Worker-Allowed', '/');
            res.setHeader('Content-Type', 'application/javascript');
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }

        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
} else {
    app.use((req, res, next) => {
        next();
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📁 Режим: ${isProduction ? 'production' : 'development'}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
});