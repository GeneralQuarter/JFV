/// <reference types="vite/client" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA, type VitePWAOptions } from 'vite-plugin-pwa';

declare let process: ImportMeta;

const pwaOptions: Partial<VitePWAOptions> = {
  base: '/',
  includeAssets: [
    'favicon.ico',
    'logo192.png',
    'logo512.png',
    'logo512mask.png',
  ],
  manifest: {
    name: 'Jardin Forestier des Vallées - Map',
    short_name: 'JFV Map',
    theme_color: '#795548',
    icons: [
      {
        src: 'logo192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'logo512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'logo512mask.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  devOptions: {
    enabled: process.env.SW_DEV === 'true',
    type: 'module',
    navigateFallback: 'index.html',
  },
};

if (process.env.SW === 'true') {
  pwaOptions.srcDir = 'src';
  pwaOptions.filename = 'prompt-sw.ts';
  pwaOptions.strategies = 'injectManifest';
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(pwaOptions)],
  server: {
    port: 3001,
  },
  build: {
    target: 'esnext',
    sourcemap: process.env.SOURCE_MAP === 'true',
  },
});
