import { formatFullLatinName, type PlantCard } from '@jfv/core/domain';
import { useMemo } from 'react';

export default function useFullLatinName(plantCard: PlantCard | undefined) {
  return useMemo(() => formatFullLatinName(plantCard), [plantCard]);
}
