import type { RectangleEntry } from '../../contentful/rectangle.entry';

export type Rectangle = {
  id: string;
  code: string;
  width: number;
  length: number;
  coords?: [number, number][];
};

export function entryToRectangle(entry: RectangleEntry): Rectangle {
  return {
    id: entry.sys.id,
    code: entry.fields.code.fr ?? '',
    width: entry.fields.width.fr ?? 1,
    length: entry.fields.length.fr ?? 1,
    coords: entry.fields.coords?.fr,
  };
}
