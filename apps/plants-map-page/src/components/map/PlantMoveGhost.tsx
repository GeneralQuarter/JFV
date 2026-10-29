import type { PageAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import circle from '@turf/circle';
import type { Feature, Polygon } from 'geojson';
import type { MapMouseEvent } from 'maplibre-gl';
import {
  type FC,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Layer, Marker, Source, useMap } from 'react-map-gl/maplibre';
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
  const { mainMap } = useMap();
  const updatePlant = useEntries((state) => state.updatePlant);
  const showCanopy = useVisibilityToggles((state) => state.canopy);
  const [currentPosition, setCurrentPosition] = useState(position);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const commitRef = useRef<(() => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const ghostFeature = useMemo<Feature<Polygon>>(
    () =>
      circle(
        [currentPosition.lon, currentPosition.lat],
        (showCanopy || diameter < 2 ? diameter : 2) / 2000,
      ),
    [currentPosition.lat, currentPosition.lon, diameter, showCanopy],
  );

  const commitPosition = useCallback(async () => {
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
  }, [currentPosition, onDone, plantId, saving, sdk, updatePlant]);

  commitRef.current = commitPosition;

  useEffect(() => {
    if (!mainMap) {
      return;
    }

    const onMapContextMenu = (event: MapMouseEvent) => {
      const features = mainMap.queryRenderedFeatures(event.point, {
        layers: ['plant-move-ghost'],
      });

      if (features.length > 0) {
        event.preventDefault();
        void commitRef.current?.();
      }
    };

    mainMap.on('contextmenu', onMapContextMenu);

    return () => {
      mainMap.off('contextmenu', onMapContextMenu);
    };
  }, [mainMap]);

  const commitMove = (event: ReactMouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    void commitPosition();
  };

  return (
    <>
      <Source type="geojson" data={ghostFeature}>
        <Layer
          id="plant-move-ghost"
          type="fill"
          paint={{
            'fill-color': 'rgba(47, 111, 78, 0.14)',
          }}
        />
        <Layer
          type="line"
          paint={{
            'line-color': '#2f6f4e',
            'line-dasharray': [2, 2],
            'line-width': 2,
          }}
        />
      </Source>
      <Marker
        anchor="center"
        draggable
        latitude={currentPosition.lat}
        longitude={currentPosition.lon}
        onDrag={(event) =>
          setCurrentPosition({
            lat: event.lngLat.lat,
            lon: event.lngLat.lng,
          })
        }
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
            height: 120,
            justifyContent: 'center',
            opacity: saving ? 0.55 : 1,
            padding: 0,
            width: 120,
          }}
          title="Right-click to confirm; Escape to cancel"
          type="button"
        >
          <span
            style={{
              background: 'rgba(47, 111, 78, 0.55)',
              borderRadius: '50%',
              height: 10,
              pointerEvents: 'none',
              width: 10,
            }}
          />
        </button>
      </Marker>
    </>
  );
};

export default PlantMoveGhost;
