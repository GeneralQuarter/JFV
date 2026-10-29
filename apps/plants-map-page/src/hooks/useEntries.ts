import type { CMAClient } from '@contentful/app-sdk';
import type {
  EntryProps,
  KeyValueMap,
  QueryOptions,
} from 'contentful-management';
import { produce } from 'immer';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const chunkSize = 1000;

async function getAllPublishedEntries<T extends KeyValueMap>(
  cma: CMAClient,
  q: QueryOptions,
) {
  const query: QueryOptions = { ...q, limit: chunkSize };
  const collection = await cma.entry.getPublished<T>({ query });
  const nbCalls = Math.ceil(collection.total / chunkSize) - 1;

  for (let i = 1; i <= nbCalls; i++) {
    query.skip = i * chunkSize;
    const chunkCollection = await cma.entry.getPublished<T>({ query });

    collection.items = collection.items.concat(chunkCollection.items);
  }

  return collection.items;
}

type EntryKey = 'plants' | 'plantCards';
const entryQueryMap: Record<EntryKey, QueryOptions> = {
  plants: {
    content_type: 'plant',
    'fields.position[exists]': true,
  },
  plantCards: {
    content_type: 'PlantCommonInfo',
  },
};
type EntriesState = {
  [P in EntryKey]: EntryProps<KeyValueMap>[];
} & {
  fetchAllEntries: (cma: CMAClient) => Promise<void>;
};

const useEntries = create<EntriesState>()(
  persist(
    (set) => ({
      ...Object.keys(entryQueryMap).reduce(
        (acc, key) => {
          acc[key as EntryKey] = [];
          return acc;
        },
        {} as Record<EntryKey, EntryProps<KeyValueMap>[]>,
      ),
      fetchAllEntries: async (cma: CMAClient) => {
        await Promise.all(
          Object.entries(entryQueryMap).map(([entryKey, query]) =>
            getAllPublishedEntries(cma, query).then((items) =>
              set(
                produce((state) => {
                  state[entryKey] = items;
                }),
              ),
            ),
          ),
        );
      },
    }),
    {
      name: 'jfv-entries',
    },
  ),
);

export default useEntries;
