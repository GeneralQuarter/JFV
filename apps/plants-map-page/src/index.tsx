import { mountContentfulApp } from '@jfv/contentful-app';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import App from './App';

// Activate en-US with no translations while we wait for the UI locale to be known
i18n.activate('en-US');

mountContentfulApp(
  <I18nProvider i18n={i18n}>
    <App />
  </I18nProvider>,
);
