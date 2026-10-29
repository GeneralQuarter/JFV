import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  base: '',
  build: {
    outDir: 'build',
  },
  server: {
    host: 'localhost',
    port: 3000,
  },
});
