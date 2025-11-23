import { defineConfig } from 'vite';

const isProduction = process.env.NODE_ENV === 'production';

export default defineConfig({
  root: 'src',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
          });
          proxy.on('proxyReq', (proxyReq, req) => {
          });
          proxy.on('proxyRes', (proxyRes, req) => {
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
        main: 'src/index.html',
        sw: 'src/sw.js'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'sw' ? '[name].js' : 'assets/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'sw.js') {
            return '[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    },
    sourcemap: !isProduction,
    target: 'es2015'
  },
  optimizeDeps: {
    include: ['handlebars'],
    exclude: ['@vite/client', '@vite/env']
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  },
  assetsInclude: ['**/*.hbs', '**/*.scss'],
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
    }
  ]
});