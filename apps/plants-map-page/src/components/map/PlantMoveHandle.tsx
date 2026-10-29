import type { PageAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { type FC, useState } from 'react';
import { Marker } from 'react-map-gl/maplibre';
import useEntries from '../../hooks/useEntries';
import useMapSelection from '../../hooks/useMapSelection';
import { plantPosition } from '../../lib/entries';
import {
  setLocalPlantPosition,
  updatePlantPosition,
} from '../../lib/mutations/plant-actions';

const PlantMoveHandle: FC = () => {
  const sdk = useSDK<PageAppSDK>();
  const plants = useEntries((state) => state.plants);
  const updatePlant = useEntries((state) => state.updatePlant);
  const selectedFeatures = useMapSelection((state) => state.selectedFeatures);
  const [dragging, setDragging] = useState(false);

  const selectedPlant =
    selectedFeatures.length === 1 && selectedFeatures[0].type === 'plant'
      ? plants.find((plant) => plant.sys.id === selectedFeatures[0].id)
      : undefined;
  const position = selectedPlant ? plantPosition(selectedPlant) : undefined;

  if (!selectedPlant || !position) {
    return null;
  }

  const onDragEnd = async (event: { lngLat: { lat: number; lng: number } }) => {
    const nextPosition = {
      lat: event.lngLat.lat,
      lon: event.lngLat.lng,
    };

    setDragging(false);

    try {
      await updatePlantPosition(sdk.cma, selectedPlant.sys.id, nextPosition);
      updatePlant(selectedPlant.sys.id, (plant) =>
        setLocalPlantPosition(plant, nextPosition),
      );
      sdk.notifier.success('Plant position updated');
    } catch (error) {
      console.error('Plant position update failed', error);
      sdk.notifier.error('Could not update the plant position.');
    }
  };

  return (
    <Marker
      anchor="center"
      draggable
      latitude={position.lat}
      longitude={position.lon}
      onDragStart={() => setDragging(true)}
      onDragEnd={onDragEnd}
    >
      <button
        aria-label="Drag to move plant"
        onClick={(event) => event.stopPropagation()}
        style={{
          background: '#ffffff',
          border: '3px solid #2f6f4e',
          borderRadius: '50%',
          boxShadow: '0 1px 5px rgba(0, 0, 0, 0.45)',
          cursor: dragging ? 'grabbing' : 'grab',
          height: 18,
          padding: 0,
          width: 18,
        }}
        title="Drag to move plant"
        type="button"
      />
    </Marker>
  );
};

export default PlantMoveHandle;
