import type { Entry, EntryFieldTypes, EntrySkeletonType } from 'contentful';
import type { plantCommonInfoContentTypeId } from './content-types';

type PlantCommonInfoFields = {
  genus: EntryFieldTypes.Symbol;
  species: EntryFieldTypes.Symbol;
  varietyCultivar?: EntryFieldTypes.Symbol;
  fullLatinName: EntryFieldTypes.Symbol;
  commonName: EntryFieldTypes.Symbol;
  width?: EntryFieldTypes.Number;
  height?: EntryFieldTypes.Number;
  sourceLinks?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
};

export type PlantCommonInfoEntrySkeleton = EntrySkeletonType<
  PlantCommonInfoFields,
  typeof plantCommonInfoContentTypeId
>;
export type PlantCommonInfoEntry = Entry<
  PlantCommonInfoEntrySkeleton,
  'WITH_ALL_LOCALES',
  'fr'
>;
