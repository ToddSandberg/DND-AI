import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The repo still contains stale compiled `.js` files next to the `.tsx`
    // sources, so resolve TypeScript first to make sure the tests exercise
    // the real sources rather than the old build output.
    extensions: ['.mts', '.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
    alias: {
      components: path.resolve(__dirname, './src/components'),
      types: path.resolve(__dirname, './src/types'),
      apis: path.resolve(__dirname, './src/apis'),
      constants: path.resolve(__dirname, './src/constants'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
