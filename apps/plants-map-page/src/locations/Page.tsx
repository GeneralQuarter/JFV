import type { PageAppSDK } from '@contentful/app-sdk';
import { Header, Layout } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect } from 'react';
import AddMenu from '../components/AddMenu';
import Divider from '../components/Divider';
import EditorMap from '../components/EditorMap';
import EntriesSearch from '../components/EntriesSearch';
import ImportPoints from '../components/ImportPoints';
import PlantMetrics from '../components/PlantMetrics';
import MapSelection from '../components/selection/MapSelection';
import VisibilityToggles from '../components/VisibilityToggles';
import useEntries from '../hooks/useEntries';

const Page = () => {
  const sdk = useSDK<PageAppSDK>();
  const cma = sdk.cma;
  const fetchAllEntries = useEntries((state) => state.fetchAllEntries);

  useEffect(() => {
    (async () => {
      if (import.meta.env.DEV) {
        return;
      }

      await fetchAllEntries(cma);
    })();
  }, [cma, fetchAllEntries]);

  /*
     To use the cma, access it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = sdk.cma;

  return (
    <Layout
      offsetTop={4}
      header={
        <Layout.Header>
          <Header
            title="JFV"
            filters={<EntriesSearch />}
            actions={
              <>
                <ImportPoints />
                <AddMenu />
              </>
            }
          />
        </Layout.Header>
      }
      leftSidebar={
        <Layout.Sidebar>
          <PlantMetrics />
          <Divider />
          <VisibilityToggles />
        </Layout.Sidebar>
      }
      rightSidebar={
        <Layout.Sidebar css={{ padding: 0, overflow: 'hidden' }}>
          <MapSelection />
        </Layout.Sidebar>
      }
    >
      <Layout.Body css={{ padding: 0 }}>
        <EditorMap />
      </Layout.Body>
    </Layout>
  );
};

export default Page;
