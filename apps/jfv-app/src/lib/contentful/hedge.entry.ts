import type { Entry, EntryFieldTypes, EntrySkeletonType } from 'contentful';
import type { CoordsJsonArray } from './coords-json-array';
import type { PlantEntrySkeleton } from './plant.entry';

type HedgeFields = {
  name: EntryFieldTypes.Symbol;
  plants: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<PlantEntrySkeleton>>;
  coords: EntryFieldTypes.Object<CoordsJsonArray>;
  wateredAt: EntryFieldTypes.Date;
};

export const hedgeContentTypeId = 'hedge';
export type HedgeEntrySkeleton = EntrySkeletonType<
  HedgeFields,
  typeof hedgeContentTypeId
>;
export type HedgeEntry = Entry<HedgeEntrySkeleton, 'WITH_ALL_LOCALES', 'fr'>;
