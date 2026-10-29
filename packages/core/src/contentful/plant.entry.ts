import type { Entry, EntryFieldTypes, EntrySkeletonType } from 'contentful';
import type { plantContentTypeId } from './content-types';
import type { PlantCommonInfoEntrySkeleton } from './plant-common-info.entry';

type PlantFields = {
  commonInfo?: EntryFieldTypes.EntryLink<PlantCommonInfoEntrySkeleton>;
  code: EntryFieldTypes.Symbol;
  sponsor?: EntryFieldTypes.Symbol;
  position?: EntryFieldTypes.Location;
  plantedAt?: EntryFieldTypes.Date;
  declaredDeadAt?: EntryFieldTypes.Date;
};

export type PlantEntrySkeleton = EntrySkeletonType<
  PlantFields,
  typeof plantContentTypeId
>;
export type PlantEntry = Entry<PlantEntrySkeleton, 'WITH_ALL_LOCALES', 'fr'>;
