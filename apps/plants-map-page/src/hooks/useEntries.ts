import type { CMAClient } from '@contentful/app-sdk';
import type {
  EntryProps,
  KeyValueMap,
  QueryOptions,
} from 'contentful-management';
import { produce } from 'immer';
import { create } from 'zustand';
import type { CmaEntry } from '../lib/entries';

const chunkSize = 1000;

async function getAllPublishedEntries(
  cma: CMAClient,
  queryOptions: QueryOptions,
): Promise<CmaEntry[]> {
  const query: QueryOptions = { ...queryOptions, limit: chunkSize };
  const collection = await cma.entry.getPublished<KeyValueMap>({ query });
  const nbCalls = Math.ceil(collection.total / chunkSize) - 1;

  for (let i = 1; i <= nbCalls; i++) {
    query.skip = i * chunkSize;
    const chunkCollection = await cma.entry.getPublished<KeyValueMap>({
      query,
    });

    collection.items = collection.items.concat(chunkCollection.items);
  }

  return collection.items;
}

type EntryKey =
  | 'plants'
  | 'plantCards'
  | 'hedges'
  | 'rectangles'
  | 'mapZones'
  | 'mapSectors';

const entryQueryMap: Record<EntryKey, QueryOptions> = {
  plants: {
    content_type: 'plant',
    'fields.position[exists]': true,
  },
  plantCards: {
    content_type: 'PlantCommonInfo',
  },
  hedges: {
    content_type: 'hedge',
  },
  rectangles: {
    content_type: 'rectangle',
  },
  mapZones: {
    content_type: 'mapZone',
  },
  mapSectors: {
    content_type: 'mapSector',
  },
};

type EntriesState = {
  [P in EntryKey]: EntryProps<KeyValueMap>[];
} & {
  loading: boolean;
  error?: string;
  fetchAllEntries: (cma: CMAClient) => Promise<void>;
  updateEntry: (entryId: string, updater: (entry: CmaEntry) => void) => void;
  updatePlant: (plantId: string, updater: (entry: CmaEntry) => void) => void;
  removePlant: (plantId: string) => void;
};

const entryKeys: EntryKey[] = [
  'plants',
  'plantCards',
  'hedges',
  'rectangles',
  'mapZones',
  'mapSectors',
];

const initialEntries = Object.keys(entryQueryMap).reduce(
  (acc, key) => {
    acc[key as EntryKey] = [];
    return acc;
  },
  {} as Record<EntryKey, EntryProps<KeyValueMap>[]>,
);

const useEntries = create<EntriesState>((set) => ({
  ...initialEntries,
  loading: false,
  error: undefined,
  fetchAllEntries: async (cma: CMAClient) => {
    set({ error: undefined, loading: true });

    try {
      const updates: Partial<Record<EntryKey, CmaEntry[]>> = {};

      await Promise.all(
        (Object.entries(entryQueryMap) as [EntryKey, QueryOptions][]).map(
          async ([key, query]) => {
            updates[key] = await getAllPublishedEntries(cma, query);
          },
        ),
      );

      set((state) => ({ ...state, ...updates, loading: false }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Could not load content',
        loading: false,
      });
    }
  },
  updateEntry: (entryId: string, updater: (entry: CmaEntry) => void) => {
    set(
      produce((state: EntriesState) => {
        for (const key of entryKeys) {
          const entry = state[key].find((item) => item.sys.id === entryId);

          if (entry) {
            updater(entry);
            return;
          }
        }
      }),
    );
  },
  updatePlant: (plantId: string, updater: (entry: CmaEntry) => void) => {
    set(
      produce((state: EntriesState) => {
        const plant = state.plants.find((item) => item.sys.id === plantId);

        if (plant) {
          updater(plant);
        }
      }),
    );
  },
  removePlant: (plantId: string) => {
    set(
      produce((state: EntriesState) => {
        state.plants = state.plants.filter((item) => item.sys.id !== plantId);
      }),
    );
  },
}));

export default useEntries;
