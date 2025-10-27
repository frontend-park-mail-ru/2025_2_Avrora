import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'public/index.html',
        sw: 'public/sw.js'
      }
    }
  },
  optimizeDeps: {
    include: ['handlebars']
  }
});