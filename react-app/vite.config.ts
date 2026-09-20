import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // The repo still contains stale compiled `.js` files next to the `.tsx`
    // sources, so resolve TypeScript first to make sure the dev server serves
    // the real sources rather than the old build output.
    extensions: ['.mts', '.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
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
          // Vite appends a token to the HMR url (/vite-hmr?token=...), so compare
          // the path only, otherwise the HMR socket gets proxied to the web server
          // and the browser reconnects in a loop.
          const pathname = req.url?.split('?')[0];
          if (req.headers.upgrade === 'websocket' && pathname !== '/vite-hmr') {
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
