import { PLANT_CODE_NUMBER_LENGTH, TAG_IDS } from './constants';
import type { PlantCard } from './models';

export function formatFullLatinName(
  plantCard?: Partial<
    Pick<PlantCard, 'genus' | 'species' | 'varietyOrCultivar'>
  >,
): string {
  const genus = plantCard?.genus ?? '';
  const species = plantCard?.species ?? '';

  if (!genus || !species) {
    return '';
  }

  const varietyOrCultivar = plantCard?.varietyOrCultivar;

  return `${genus} ${species}${varietyOrCultivar ? ` '${varietyOrCultivar}'` : ''}`;
}

export function plantCodePrefix(genus = '', species = ''): string {
  return `${genus.slice(0, 2)}${species.slice(0, 2)}`.toUpperCase();
}

export function formatPlantCodeNumber(n: number): string {
  return n.toString().padStart(PLANT_CODE_NUMBER_LENGTH, '0');
}

export function normalizeSearchTerm(term: string): string {
  return term
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

export function hasTag(tags: readonly string[], tag: string): boolean {
  return tags.includes(tag);
}

export function isDead(plant: { tags: readonly string[] }): boolean {
  return hasTag(plant.tags, TAG_IDS.dead);
}

export function isPlanted(plant: { tags: readonly string[] }): boolean {
  return hasTag(plant.tags, TAG_IDS.planted);
}
