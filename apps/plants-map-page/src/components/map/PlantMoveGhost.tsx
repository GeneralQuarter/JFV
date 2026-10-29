import type { PageAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { mapDefaults } from '@jfv/map-data';
import circle from '@turf/circle';
import {
  type FC,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
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

    const updateZoom = () => {
      const nextZoom = mainMap.getZoom();
      setZoom((currentZoom) =>
        currentZoom === nextZoom ? currentZoom : nextZoom,
      );
    };

    updateZoom();
    mainMap.on('zoom', updateZoom);
    mainMap.on('move', updateZoom);

    return () => {
      mainMap.off('zoom', updateZoom);
      mainMap.off('move', updateZoom);
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

  const visualSize = useMemo(() => {
    if (!mainMap) {
      return visibleDiameter / metersPerPixel;
    }

    const geometry = circle(
      [currentPosition.lon, currentPosition.lat],
      visibleDiameter / 2000,
    ).geometry.coordinates[0];
    let minX = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const [lon, lat] of geometry) {
      const point = mainMap.project([lon, lat]);
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    return Math.max(maxX - minX, maxY - minY);
  }, [currentPosition, mainMap, metersPerPixel, visibleDiameter]);

  const hitSize = Math.max(28, visualSize + 12);

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
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          cursor: dragging ? 'grabbing' : 'grab',
          display: 'flex',
          height: hitSize,
          justifyContent: 'center',
          opacity: saving ? 0.55 : 1,
          padding: 0,
          width: hitSize,
        }}
        title="Right-click to confirm; Escape to cancel"
        type="button"
      >
        <span
          style={{
            background: 'rgba(47, 111, 78, 0.14)',
            border: '2px dashed #2f6f4e',
            borderRadius: '50%',
            height: visualSize,
            pointerEvents: 'none',
            width: visualSize,
          }}
        />
      </button>
    </Marker>
  );
};

export default PlantMoveGhost;
