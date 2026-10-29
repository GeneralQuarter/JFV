import type { Entry, EntryFieldTypes, EntrySkeletonType } from 'contentful';
import type { CoordsJsonArray } from './coords-json-array';

type RectangleFields = {
  label: EntryFieldTypes.Symbol;
  code: EntryFieldTypes.Symbol;
  width: EntryFieldTypes.Number;
  length: EntryFieldTypes.Number;
  coords?: EntryFieldTypes.Object<CoordsJsonArray>;
};

export const rectangleContentTypeId = 'rectangle';
export type RectangleEntrySkeleton = EntrySkeletonType<
  RectangleFields,
  typeof rectangleContentTypeId
>;
export type RectangleEntry = Entry<
  RectangleEntrySkeleton,
  'WITH_ALL_LOCALES',
  'fr'
>;
