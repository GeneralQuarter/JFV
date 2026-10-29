import { mountContentfulApp } from '@jfv/contentful-app';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import App from './App';

// Do not load translations yet as we do not know the UI locale language yet
i18n.activate('en-US');

mountContentfulApp(
  <I18nProvider i18n={i18n}>
    <App />
  </I18nProvider>,
);
