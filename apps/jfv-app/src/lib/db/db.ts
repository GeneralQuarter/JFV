import {
  contentfulTagToTag,
  entryToHedge,
  entryToPlant,
  entryToPlantCard,
  entryToRectangle,
  hedgeContentTypeId,
  plantCommonInfoContentTypeId,
  plantContentTypeId,
  rectangleContentTypeId,
} from '@jfv/core/contentful';
import type { Hedge, Plant, PlantCard, Rectangle, Tag } from '@jfv/core/domain';
import { createClient, type SyncQuery } from 'contentful';
import Dexie, { type BulkError, type EntityTable } from 'dexie';

const entryToEntity = {
  [plantContentTypeId]: {
    table: 'plants',
    toEntity: entryToPlant,
  },
  [plantCommonInfoContentTypeId]: {
    table: 'plantCards',
    toEntity: entryToPlantCard,
  },
  [rectangleContentTypeId]: {
    table: 'rectangles',
    toEntity: entryToRectangle,
  },
  [hedgeContentTypeId]: {
    table: 'hedges',
    toEntity: entryToHedge,
  },
} as const;

type EntryToEntity = typeof entryToEntity;
type SyncContentType = keyof EntryToEntity;
type EntitiesByContentType = {
  [ContentType in SyncContentType]: ReturnType<
    EntryToEntity[ContentType]['toEntity']
  >[];
};

const db = new Dexie('JFV') as Dexie & {
  tags: EntityTable<Tag, 'id'>;
  plants: EntityTable<Plant, 'id'>;
  plantCards: EntityTable<PlantCard, 'id'>;
  rectangles: EntityTable<Rectangle, 'id'>;
  hedges: EntityTable<Hedge, 'id'>;
};

db.version(2).stores({
  tags: 'id',
  plants: 'id, plantCardId, &code, godparent, plantedAt, declaredDeadAt, *tags',
  plantCards:
    'id, commonName, genus, species, varietyOrCultivar, height, diameter, *tags',
  rectangles: 'id, code, width, length',
  hedges: 'id, name, wateredAt',
});

async function clearAllSyncedTables() {
  for (const { table } of Object.values(entryToEntity)) {
    await db[table].clear();
  }
}

const syncTokenKey = 'jfv-contentful-next-sync-token';

function getNextSyncToken() {
  return localStorage.getItem(syncTokenKey);
}

function setNextSyncToken(token: string) {
  localStorage.setItem(syncTokenKey, token);
}

export async function sync() {
  if (!navigator.onLine || !import.meta.env.PROD) {
    return;
  }

  const client = createClient({
    space: import.meta.env.VITE_CONTENTFUL_SPACE,
    accessToken: import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN,
  });

  const nextSyncToken = getNextSyncToken();
  const syncQuery: SyncQuery = nextSyncToken
    ? { nextSyncToken }
    : { initial: true };

  if (syncQuery.initial) {
    await clearAllSyncedTables();
  }

  const {
    entries,
    deletedEntries,
    nextSyncToken: newNextSyncToken,
  } = await client.withoutLinkResolution.sync(syncQuery);

  const entitiesByContentType = entries.reduce(
    (acc, entry) => {
      const contentType = entry.sys.contentType.sys.id as SyncContentType;

      if (contentType in entryToEntity) {
        /** @ts-expect-error */
        acc[contentType].push(entryToEntity[contentType].toEntity(entry));
      }

      return acc;
    },
    Object.keys(entryToEntity).reduce((acc, k) => {
      acc[k as SyncContentType] = [];
      return acc;
    }, {} as EntitiesByContentType),
  );

  for (const [contentType, entities] of Object.entries(entitiesByContentType)) {
    const table = entryToEntity[contentType as SyncContentType].table;

    try {
      /** @ts-expect-error entities should match the table structure */
      await db[table].bulkPut(entities);
    } catch (e) {
      if ((e as BulkError).name === 'BulkError') {
        console.warn(`Errors while bulkPut on ${table}`, e);
      } else {
        throw e;
      }
    }
  }

  const deletedIds = deletedEntries.map((entry) => entry.sys.id);

  for (const { table } of Object.values(entryToEntity)) {
    await db[table].bulkDelete(deletedIds);
  }

  if (newNextSyncToken) {
    setNextSyncToken(newNextSyncToken);
  }

  const tagCollection = await client.getTags();
  const tags = tagCollection.items.map(contentfulTagToTag);
  tags.push({
    id: 'sponsored',
    label: 'Parrainé',
  });
  await db.tags.bulkPut(tags);
}

export { db };
