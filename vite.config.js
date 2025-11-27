import { defineConfig } from 'vite';
import { resolve } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

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
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log('Proxy Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Proxy Response:', proxyRes.statusCode, req.url);
          });
        }
      },
    },
    hmr: {
      overlay: false
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    minify: isProduction ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      },
      mangle: {
        toplevel: true
      },
      format: {
        comments: false
      }
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        sw: resolve(__dirname, 'src/sw.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'sw' ? '[name].js' : 'assets/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name.split('.').pop();
          if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (assetInfo.name === 'sw.js') {
            return '[name].[ext]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    sourcemap: !isProduction,
    target: 'es2015',
    assetsInlineLimit: 4096,
  },
  optimizeDeps: {
    include: ['handlebars'],
    exclude: ['@vite/client', '@vite/env']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  assetsInclude: ['**/*.hbs', '**/*.scss', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
  appType: 'spa',
  plugins: [
    {
      name: 'service-worker-dev',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/sw.js') {
            res.setHeader('Content-Type', 'application/javascript');
            res.end('// Service Worker disabled in development mode');
            return;
          }
          next();
        });
      }
    },
    {
      name: 'copy-hbs-assets',
      buildStart() {

      },
      generateBundle() {

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