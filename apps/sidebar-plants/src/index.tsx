import { GlobalStyles } from '@contentful/f36-components';
import { SDKProvider } from '@contentful/react-apps-toolkit';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Activate en-US with no translations while we wait for the UI locale to be known
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
