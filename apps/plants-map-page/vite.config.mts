import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
    }),
  ],
  base: '',
  build: {
    outDir: 'build',
  },
  server: {
    allowedHosts: true,
    host: 'localhost',
    port: 3002,
    strictPort: true,
  },
});
