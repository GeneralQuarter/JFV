import { i18n } from '@lingui/core';
import { messages as enUS } from './locales/en-US.po';
import { messages as frFR } from './locales/fr-FR.po';

export async function loadCatalog(locale: string = 'en-US') {
  const normalized = locale.startsWith('fr') ? 'fr-FR' : 'en-US';

  i18n.loadAndActivate({
    locale: normalized,
    messages: normalized === 'fr-FR' ? frFR : enUS,
  });
}
