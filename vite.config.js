import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    },
    hmr: { overlay: false }
  },

  build: {
    outDir: '../dist',
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        sw: resolve(__dirname, 'src/sw.js'),
      },

      output: {
        entryFileNames: chunk => {
          if (chunk.name === 'sw') return 'sw.js';
          return 'assets/[name]-[hash].js';
        },
        assetFileNames: assetInfo => {
          const ext = assetInfo.name.split('.').pop();
          const images = ['png','jpg','jpeg','gif','svg','webp'];

          if (images.includes(ext)) {
            return 'assets/images/[name]-[hash][extname]';
          }

          if (assetInfo.name === 'sw.js') {
            return 'sw.js';
          }

          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },

  plugins: [
    {
      name: 'service-worker-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/sw.js') {
            res.setHeader('Content-Type', 'application/javascript');
            res.end('// SW disabled in dev');
            return;
          }
          next();
        });
      }
    }
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@public': resolve(__dirname, 'public'),
      '@images': resolve(__dirname, 'public/images')
    }
  }
});
