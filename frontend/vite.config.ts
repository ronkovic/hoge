import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // @ts-expect-error - vitest config
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    ui: false,
    watch: false,
    exclude: ['**/e2e/**', '**/node_modules/**', '**/dist/**'],
  },
});
