import type { Tag as ContentfulTag } from 'contentful';
import type { Hedge, Plant, PlantCard, Rectangle, Tag } from '../domain/models';
import type { HedgeEntry } from './hedge.entry';
import type { PlantEntry } from './plant.entry';
import type { PlantCommonInfoEntry } from './plant-common-info.entry';
import type { RectangleEntry } from './rectangle.entry';
import toDate from './to-date';

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

export function entryToPlantCard(entry: PlantCommonInfoEntry): PlantCard {
  return {
    id: entry.sys.id,
    commonName: entry.fields.commonName.fr ?? '',
    genus: entry.fields.genus.fr ?? '',
    species: entry.fields.species.fr ?? '',
    varietyOrCultivar: entry.fields.varietyCultivar?.fr ?? '',
    height: entry.fields.height?.fr ?? 1,
    diameter: entry.fields.width?.fr ?? 1,
    sourceLinks: entry.fields.sourceLinks?.fr ?? [],
    tags: entry.metadata.tags.map((t) => t.sys.id),
  };
}

export function entryToHedge(entry: HedgeEntry): Hedge {
  return {
    id: entry.sys.id,
    name: entry.fields.name.fr ?? '',
    coords: entry.fields.coords.fr,
    wateredAt: toDate(entry.fields.wateredAt?.fr),
  };
}

export function entryToRectangle(entry: RectangleEntry): Rectangle {
  return {
    id: entry.sys.id,
    label: entry.fields.label.fr ?? '',
    code: entry.fields.code.fr ?? '',
    width: entry.fields.width.fr ?? 1,
    length: entry.fields.length.fr ?? 1,
    coords: entry.fields.coords?.fr,
  };
}

export function contentfulTagToTag(contentfulTag: ContentfulTag): Tag {
  return {
    id: contentfulTag.sys.id,
    label: contentfulTag.name,
  };
}
