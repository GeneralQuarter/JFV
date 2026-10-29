import { locations } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { ContentfulApp } from '@jfv/contentful-app';
import { useEffect, useState } from 'react';
import { loadCatalog } from './i18n';
import Page from './locations/Page';

const locationMap = {
  [locations.LOCATION_PAGE]: Page,
};

const App = () => {
  const sdk = useSDK();
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    const locale = (sdk.uiLanguageLocale ?? 'en-US').toLowerCase();

    void loadCatalog(locale.startsWith('fr') ? 'fr-FR' : 'en-US').finally(() =>
      setReady(true),
    );
  }, [sdk]);

  if (!isReady) {
    return null;
  }

  return <ContentfulApp locations={locationMap} />;
};

export default App;
