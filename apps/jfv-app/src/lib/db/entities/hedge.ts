import type { HedgeEntry } from '../../contentful/hedge.entry';
import toDate from '../to-date';

export type Hedge = {
  id: string;
  name: string;
  coords?: [number, number][];
  wateredAt?: Date;
};

export function entryToHedge(entry: HedgeEntry): Hedge {
  return {
    id: entry.sys.id,
    name: entry.fields.name.fr ?? '',
    coords: entry.fields.coords.fr,
    wateredAt: toDate(entry.fields.wateredAt?.fr),
  };
}
