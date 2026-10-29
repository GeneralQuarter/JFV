import type { PageAppSDK } from '@contentful/app-sdk';
import { Header, Layout, Note, Spinner } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect } from 'react';
import AddMenu from '../components/AddMenu';
import Divider from '../components/Divider';
import EditorMap from '../components/EditorMap';
import EntriesSearch from '../components/EntriesSearch';
import ImportPoints from '../components/ImportPoints';
import PlantMetrics from '../components/PlantMetrics';
import MapSelection from '../components/selection/MapSelection';
import TagsSelector from '../components/TagsSelector';
import VisibilityToggles from '../components/VisibilityToggles';
import useEntries from '../hooks/useEntries';
import useTags from '../hooks/useTags';

if (import.meta.env.DEV) {
  console.info('[JFV editor] local dev build: ghost-v2');
}

const Page = () => {
  const sdk = useSDK<PageAppSDK>();
  const cma = sdk.cma;
  const fetchAllEntries = useEntries((state) => state.fetchAllEntries);
  const fetchTags = useTags((state) => state.fetchTags);
  const loading = useEntries((state) => state.loading);
  const error = useEntries((state) => state.error);

  useEffect(() => {
    void fetchAllEntries(cma);
  }, [cma, fetchAllEntries]);

  useEffect(() => {
    void fetchTags(cma);
  }, [cma, fetchTags]);

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
          <Divider />
          <TagsSelector />
        </Layout.Sidebar>
      }
      rightSidebar={
        <Layout.Sidebar css={{ padding: 0, overflow: 'hidden' }}>
          <MapSelection />
        </Layout.Sidebar>
      }
    >
      <Layout.Body css={{ padding: 0, position: 'relative' }}>
        <EditorMap />
        {loading && (
          <div
            style={{
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.45)',
              display: 'flex',
              inset: 0,
              justifyContent: 'center',
              position: 'absolute',
              zIndex: 1,
            }}
          >
            <Spinner size="large" />
          </div>
        )}
        {error && (
          <Note
            style={{
              bottom: 16,
              left: 16,
              position: 'absolute',
              right: 16,
              zIndex: 2,
            }}
            variant="negative"
          >
            Impossible de charger le contenu : {error}
          </Note>
        )}
      </Layout.Body>
    </Layout>
  );
};

export default Page;
