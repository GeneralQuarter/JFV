import { GlobalStyles } from '@contentful/f36-components';
import { SDKProvider } from '@contentful/react-apps-toolkit';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Do not load translations yet as we do not know the UI locale language yet
i18n.activate('en-US');

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <SDKProvider>
    <I18nProvider i18n={i18n}>
      <GlobalStyles />
      <App />
    </I18nProvider>
  </SDKProvider>,
);
