import type { PageAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { mapDefaults } from '@jfv/map-data';
import {
  type FC,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useState,
} from 'react';
import { Marker, useMap } from 'react-map-gl/maplibre';
import useEntries from '../../hooks/useEntries';
import useVisibilityToggles from '../../hooks/useVisibilityToggles';
import {
  setLocalPlantPosition,
  updatePlantPosition,
} from '../../lib/mutations/plant-actions';

type PlantMoveGhostProps = {
  plantId: string;
  position: { lat: number; lon: number };
  diameter: number;
  onDone: () => void;
  onCancel: () => void;
};

const PlantMoveGhost: FC<PlantMoveGhostProps> = ({
  plantId,
  position,
  diameter,
  onDone,
  onCancel,
}) => {
  const sdk = useSDK<PageAppSDK>();
  const updatePlant = useEntries((state) => state.updatePlant);
  const showCanopy = useVisibilityToggles((state) => state.canopy);
  const { mainMap } = useMap();
  const [currentPosition, setCurrentPosition] = useState(position);
  const [zoom, setZoom] = useState(mainMap?.getZoom() ?? mapDefaults.zoom);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!mainMap) {
      return;
    }

    const updateZoom = () => setZoom(mainMap.getZoom());

    updateZoom();
    mainMap.on('zoom', updateZoom);

    return () => {
      mainMap.off('zoom', updateZoom);
    };
  }, [mainMap]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const metersPerPixel =
    (156543.03392 * Math.cos((currentPosition.lat * Math.PI) / 180)) /
    2 ** zoom;
  const visibleDiameter = showCanopy ? diameter : Math.min(diameter, 2);
  const size = Math.max(10, visibleDiameter / metersPerPixel);

  const commitMove = async (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (saving) {
      return;
    }

    setSaving(true);

    try {
      await updatePlantPosition(sdk.cma, plantId, currentPosition);
      updatePlant(plantId, (plant) =>
        setLocalPlantPosition(plant, currentPosition),
      );
      sdk.notifier.success('Plant position updated');
      onDone();
    } catch (error) {
      console.error('Plant position update failed', error);
      sdk.notifier.error('Could not update the plant position.');
      setSaving(false);
    }
  };

  return (
    <Marker
      anchor="center"
      draggable
      latitude={currentPosition.lat}
      longitude={currentPosition.lon}
      onDragEnd={(event) =>
        setCurrentPosition({
          lat: event.lngLat.lat,
          lon: event.lngLat.lng,
        })
      }
      onDragStart={() => setDragging(true)}
    >
      <button
        aria-label="Right-click to confirm the new plant position"
        onClick={(event) => event.stopPropagation()}
        onContextMenu={commitMove}
        style={{
          background: 'rgba(47, 111, 78, 0.14)',
          border: '2px dashed #2f6f4e',
          borderRadius: '50%',
          cursor: dragging ? 'grabbing' : 'grab',
          height: size,
          opacity: saving ? 0.55 : 1,
          padding: 0,
          width: size,
        }}
        title="Right-click to confirm; Escape to cancel"
        type="button"
      />
    </Marker>
  );
};

export default PlantMoveGhost;
