import { GlobalStyles } from '@contentful/f36-components';
import { SDKProvider } from '@contentful/react-apps-toolkit';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root')!;
const root = createRoot(container);

const queryClient = new QueryClient();

root.render(
  <SDKProvider>
    <QueryClientProvider client={queryClient}>
      <GlobalStyles />
      <App />
    </QueryClientProvider>
  </SDKProvider>,
);
