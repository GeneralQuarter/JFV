import { useMemo } from 'react';
import type { PlantCard } from '../lib/db/entities/plant-card';

export default function useFullLatinName(plantCard: PlantCard | undefined) {
  return useMemo(() => {
    const genus = plantCard?.genus;
    const species = plantCard?.species;
    const varietyOrCultivar = plantCard?.varietyOrCultivar;

    return `${genus} ${species}${varietyOrCultivar ? ` '${varietyOrCultivar}'` : ''}`;
  }, [plantCard]);
}
