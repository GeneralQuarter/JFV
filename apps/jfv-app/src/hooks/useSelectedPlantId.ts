import { useCallback, useState } from 'react';

type UseSelectedPlantId = [
  selectedPlantId: string | undefined,
  setSelectedPlantId: (selectedPlantId: string | undefined) => void,
  toggleSelectedPlantId: (selectedPlantId: string) => void,
];

export default function useSelectedPlantId(): UseSelectedPlantId {
  const [selectedPlantId, setSelectedPlantId] = useState<string | undefined>(
    undefined,
  );

  const toggle = useCallback((selectedPlantId: string) => {
    setSelectedPlantId((id) =>
      id === selectedPlantId ? undefined : selectedPlantId,
    );
  }, []);

  return [selectedPlantId, setSelectedPlantId, toggle];
}
