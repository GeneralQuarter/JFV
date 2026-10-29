import { defineConfig } from '@lingui/cli';

export default defineConfig({
  sourceLocale: 'en-US',
  locales: ['en-US', 'fr-FR'],
  catalogs: [
    {
      path: 'src/locales/{locale}',
      include: ['src'],
    },
  ],
});
