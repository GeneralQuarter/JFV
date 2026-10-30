import NiceModal from '@ebay/nice-modal-react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MapProvider } from 'react-map-gl/maplibre';
import App from './App';
import theme from './theme';

const rootEl = document.getElementById('root');

if (!rootEl) {
  throw new Error('Missing root element');
}

createRoot(rootEl).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NiceModal.Provider>
        <MapProvider>
          <App />
        </MapProvider>
      </NiceModal.Provider>
    </ThemeProvider>
  </StrictMode>,
);
