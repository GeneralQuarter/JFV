import type { FC } from 'react';
import useMapSelection from '../../hooks/useMapSelection';
import EmptySelection from './EmptySelection';
import MultiSelection from './MultiSelection';
import SingleSelection from './SingleSelection';

type MapSelectionProps = {};

const MapSelection: FC<MapSelectionProps> = () => {
  const selectedFeatures = useMapSelection((state) => state.selectedFeatures);

  return (
    <>
      {selectedFeatures.length === 0 && <EmptySelection />}
      {selectedFeatures.length === 1 && (
        <SingleSelection feature={selectedFeatures[0]} />
      )}
      {selectedFeatures.length > 1 && (
        <MultiSelection features={selectedFeatures} />
      )}
    </>
  );
};

export default MapSelection;
