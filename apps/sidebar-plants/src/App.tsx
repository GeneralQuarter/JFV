import { locations } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { ContentfulApp } from '@jfv/contentful-app';
import { useEffect } from 'react';
import { loadCatalog } from './i18n';
import Sidebar from './locations/Sidebar';

const locationMap = {
  [locations.LOCATION_ENTRY_SIDEBAR]: Sidebar,
};

const App = () => {
  const sdk = useSDK();

  useEffect(() => {
    loadCatalog(sdk.uiLanguageLocale ?? 'en-US');
  }, [sdk]);

  return <ContentfulApp locations={locationMap} />;
};

export default App;
