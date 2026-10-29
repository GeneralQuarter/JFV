import type { PlantCommonInfoEntry } from '../../contentful/plant-common-info.entry';

export type PlantCard = {
  id: string;
  commonName: string;
  genus: string;
  species: string;
  varietyOrCultivar: string;
  height: number;
  diameter: number;
  sourceLinks: string[];
  tags: string[];
};

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
