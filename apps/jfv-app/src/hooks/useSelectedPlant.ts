import { useMemo } from 'react';
import type { Plant } from '../lib/db/entities/plant';

export default function useSelectedPlant(
  plants: Plant[] | undefined,
  selectedPlantId: string | undefined,
): Plant | undefined {
  return useMemo<Plant | undefined>(
    () =>
      selectedPlantId
        ? (plants || []).find((p) => p.id === selectedPlantId)
        : undefined,
    [plants, selectedPlantId],
  );
}
