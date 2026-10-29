import { locations } from '@contentful/app-sdk';
import { ContentfulApp } from '@jfv/contentful-app';
import Field from './locations/Field';

const locationMap = {
  [locations.LOCATION_ENTRY_FIELD]: Field,
};

const App = () => <ContentfulApp locations={locationMap} />;

export default App;
