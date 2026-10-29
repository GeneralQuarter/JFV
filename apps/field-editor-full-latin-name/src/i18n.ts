import { i18n } from '@lingui/core';

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export async function loadCatalog(locale: string = 'en-US') {
  const { messages } = await import(`./locales/${locale}.po`);
  i18n.loadAndActivate({ locale, messages });
}
