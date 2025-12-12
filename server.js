import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Улучшенная CORS настройка
app.use((req, res, next) => {
  // В production разрешаем все локальные хосты
  if (isProduction) {
    const origin = req.headers.origin;
    if (origin && origin.includes('localhost')) {
      res.header("Access-Control-Allow-Origin", origin);
    } else if (origin) {
      res.header("Access-Control-Allow-Origin", origin);
    } else {
      res.header("Access-Control-Allow-Origin", '*');
    }
  } else {
    // В development разрешаем localhost:3000
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  }
  
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    mode: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, 'dist', 'sw.js'));
});

app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: isProduction ? '1y' : '0',
  setHeaders: (res, filepath) => {
    if (filepath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    else if (filepath.endsWith('.js') || filepath.endsWith('.css')) {
      res.setHeader('Cache-Control', isProduction 
        ? 'public, max-age=31536000, immutable' 
        : 'no-cache'
      );
    }
    else {
      res.setHeader('Cache-Control', isProduction 
        ? 'public, max-age=86400' 
        : 'no-cache'
      );
    }
  }
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const HOST = isProduction ? '0.0.0.0' : 'localhost';
app.listen(PORT, HOST, () => {
  console.log(`
🚀 Server running in ${isProduction ? 'production' : 'development'} mode
📍 URL: http://${HOST}:${PORT}
📊 NODE_ENV: ${process.env.NODE_ENV || 'development'}
`);
});

const gracefulShutdown = () => {
  console.log('Received shutdown signal, closing server...');
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);