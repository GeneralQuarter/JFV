import { GlobalStyles } from '@contentful/f36-components';
import { SDKProvider } from '@contentful/react-apps-toolkit';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

export function mountContentfulApp(children: ReactNode) {
  const container = document.getElementById('root');

  if (!container) {
    throw new Error('Missing root element');
  }

  createRoot(container).render(
    <SDKProvider>
      <GlobalStyles />
      {children}
    </SDKProvider>,
  );
}
