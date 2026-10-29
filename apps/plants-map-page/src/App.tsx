import { locations } from '@contentful/app-sdk';
import { ContentfulApp } from '@jfv/contentful-app';
import Page from './locations/Page';

const locationMap = {
  [locations.LOCATION_PAGE]: Page,
};

const App = () => <ContentfulApp locations={locationMap} />;

export default App;
