import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      plugins: [['@lingui/swc-plugin', {}]],
    }),
    lingui(),
  ],
  base: '',
  build: {
    outDir: 'build',
  },
  server: {
    host: 'localhost',
    port: 3000,
  },
});
