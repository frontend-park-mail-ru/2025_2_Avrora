import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';
  const isDocker = env.DOCKER === 'true';
  
  return {
    root: 'src',
    publicDir: '../public',
    
    server: {
      port: parseInt(env.VITE_PORT || '3000'),
      host: env.VITE_HOST || 'localhost',
      proxy: {
        '/api/v1': {
          target: env.VITE_API_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    },

    build: {
      outDir: '../dist',
      emptyOutDir: true,
      sourcemap: isProd ? false : true,
      minify: isProd ? 'terser' : false,
      target: 'es2020',
      
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'src/index.html'),
        },
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name === 'sw.js') {
              return 'sw.js';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      },
    },

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@public': resolve(__dirname, 'public'),
        '@images': resolve(__dirname, 'public/images')
      }
    },

    define: {
      'import.meta.env.APP_NAME': JSON.stringify(env.APP_NAME || 'Homa'),
      'import.meta.env.APP_VERSION': JSON.stringify(env.APP_VERSION || '1.0.0'),
      'import.meta.env.API_URL': JSON.stringify(isProd ? '/api/v1' : (env.API_URL || '/api/v1')),
    }
  };
});