import { locations } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { ContentfulApp } from '@jfv/contentful-app';
import { useEffect } from 'react';
import { loadCatalog } from './i18n';
import Field from './locations/Field';

const locationMap = {
  [locations.LOCATION_ENTRY_FIELD]: Field,
};

const App = () => {
  const sdk = useSDK();

  useEffect(() => {
    loadCatalog(sdk.uiLanguageLocale ?? 'en-US');
  }, [sdk]);

  return <ContentfulApp locations={locationMap} />;
};

export default App;
