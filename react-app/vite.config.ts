import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      types: path.resolve(__dirname, './src/types'),
      apis: path.resolve(__dirname, './src/apis'),
      constants: path.resolve(__dirname, './src/constants'),
    },
  },
  server: {
    port: 5173,
    hmr: {
      path: '/vite-hmr',
    },
    proxy: {
      '/audio.wav': 'http://localhost:9000',
      '/': {
        target: 'http://localhost:9000',
        ws: true,
        changeOrigin: true,
        bypass: (req, res, options) => {
          if (req.headers.upgrade === 'websocket' && req.url !== '/vite-hmr') {
            return undefined; // Proxy the websocket
          }
          return req.url; // Let Vite serve standard HTTP requests
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
