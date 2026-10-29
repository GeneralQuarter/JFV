import type { PlantEntry } from '../../contentful/plant.entry';
import toDate from '../to-date';
import type { PlantCard } from './plant-card';

export type Plant = {
  id: string;
  plantCardId?: string;
  plantCard?: PlantCard;
  code: string;
  godparent?: string;
  position?: [number, number];
  plantedAt?: Date;
  declaredDeadAt?: Date;
  tags: string[];
};

export function entryToPlant(entry: PlantEntry): Plant {
  return {
    id: entry.sys.id,
    plantCardId: entry.fields.commonInfo?.fr?.sys.id,
    code: entry.fields.code.fr as string,
    godparent: entry.fields.sponsor?.fr,
    position: entry.fields.position?.fr && [
      entry.fields.position.fr.lat,
      entry.fields.position.fr.lon,
    ],
    plantedAt: toDate(entry.fields.plantedAt?.fr),
    declaredDeadAt: toDate(entry.fields.declaredDeadAt?.fr),
    tags: entry.metadata.tags.map((t) => t.sys.id),
  };
}
