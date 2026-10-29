import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  base: '',
  build: {
    outDir: 'build',
  },
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      '@contentful/app-sdk',
      '@contentful/react-apps-toolkit',
    ],
  },
  server: {
    host: 'localhost',
    port: 3000,
  },
});
