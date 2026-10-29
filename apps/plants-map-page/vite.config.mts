import { lingui } from '@lingui/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      },
      jsxImportSource: '@emotion/react',
    }),
    lingui(),
  ],
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
    allowedHosts: true,
    hmr: {
      clientPort: 443,
      host: 'editor.localhost',
      protocol: 'wss',
    },
    host: '127.0.0.1',
    port: 3002,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
});
