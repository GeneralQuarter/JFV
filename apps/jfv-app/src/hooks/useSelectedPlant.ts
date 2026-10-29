import type { Plant } from '@jfv/core/domain';
import { useMemo } from 'react';

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
