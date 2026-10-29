import { locations } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useMemo } from 'react';
import { loadCatalog } from './i18n';
import Sidebar from './locations/Sidebar';

const ComponentLocationSettings = {
  [locations.LOCATION_ENTRY_SIDEBAR]: Sidebar,
};

const App = () => {
  const sdk = useSDK();

  useEffect(() => {
    loadCatalog(sdk.uiLanguageLocale ?? 'en-US');
  }, [sdk]);

  const Component = useMemo(() => {
    for (const [location, component] of Object.entries(
      ComponentLocationSettings,
    )) {
      if (sdk.location.is(location)) {
        return component;
      }
    }
  }, [sdk.location]);

  return Component ? <Component /> : null;
};

export default App;
