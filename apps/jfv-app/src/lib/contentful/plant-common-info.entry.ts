import type { Entry, EntryFieldTypes, EntrySkeletonType } from 'contentful';

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

export const plantCommonInfoContentTypeId = 'PlantCommonInfo';
export type PlantCommonInfoEntrySkeleton = EntrySkeletonType<
  PlantCommonInfoFields,
  typeof plantCommonInfoContentTypeId
>;
export type PlantCommonInfoEntry = Entry<
  PlantCommonInfoEntrySkeleton,
  'WITH_ALL_LOCALES',
  'fr'
>;
