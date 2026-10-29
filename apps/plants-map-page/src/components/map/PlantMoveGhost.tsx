import type { PageAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import circle from '@turf/circle';
import type { Feature, Point, Polygon } from 'geojson';
import type { MapLayerMouseEvent, MapMouseEvent } from 'maplibre-gl';
import {
  type FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Layer, Source, useMap } from 'react-map-gl/maplibre';
import useEntries from '../../hooks/useEntries';
import useVisibilityToggles from '../../hooks/useVisibilityToggles';
import {
  setLocalPlantPosition,
  updatePlantPosition,
} from '../../lib/mutations/plant-actions';
import { mapBackgroundColor } from '../../theme';

const GHOST_FILL_LAYER = 'plant-move-ghost';
const GHOST_CENTER_LAYER = 'plant-move-ghost-center';
const GHOST_LABEL_LAYER = 'plant-move-ghost-label';
const GHOST_LAYERS = [GHOST_FILL_LAYER, GHOST_CENTER_LAYER, GHOST_LABEL_LAYER];

type PlantMoveGhostProps = {
  plantId: string;
  code: string;
  position: { lat: number; lon: number };
  diameter: number;
  onDone: () => void;
  onCancel: () => void;
};

const PlantMoveGhost: FC<PlantMoveGhostProps> = ({
  plantId,
  code,
  position,
  diameter,
  onDone,
  onCancel,
}) => {
  const sdk = useSDK<PageAppSDK>();
  const { current: mainMap } = useMap();
  const updatePlant = useEntries((state) => state.updatePlant);
  const showCanopy = useVisibilityToggles((state) => state.canopy);
  const showLabels = useVisibilityToggles((state) => state.plantLabels);
  const [currentPosition, setCurrentPosition] = useState(position);
  const [saving, setSaving] = useState(false);
  const currentPositionRef = useRef(currentPosition);
  const savingRef = useRef(saving);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef({ lat: 0, lon: 0 });
  const onCancelRef = useRef(onCancel);
  const commitRef = useRef<(() => Promise<void>) | undefined>(undefined);

  currentPositionRef.current = currentPosition;
  savingRef.current = saving;
  onCancelRef.current = onCancel;

  const ghostFeature = useMemo<Feature<Polygon>>(
    () =>
      circle(
        [currentPosition.lon, currentPosition.lat],
        (showCanopy || diameter < 2 ? diameter : 2) / 2000,
        {
          properties: { code },
        },
      ),
    [code, currentPosition.lat, currentPosition.lon, diameter, showCanopy],
  );

  const ghostCenterFeature = useMemo<Feature<Point>>(
    () => ({
      type: 'Feature',
      properties: { code },
      geometry: {
        type: 'Point',
        coordinates: [currentPosition.lon, currentPosition.lat],
      },
    }),
    [code, currentPosition.lat, currentPosition.lon],
  );

  const endDrag = useCallback(() => {
    if (!draggingRef.current) {
      return;
    }

    draggingRef.current = false;

    if (mainMap) {
      const map = mainMap.getMap();
      map.dragPan.enable();
      map.getCanvas().style.cursor = '';
    }
  }, [mainMap]);

  const commitPosition = useCallback(async () => {
    if (savingRef.current) {
      return;
    }

    setSaving(true);
    endDrag();

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
  }, [currentPosition, endDrag, onDone, plantId, sdk, updatePlant]);

  commitRef.current = commitPosition;

  useEffect(() => {
    if (!mainMap) {
      return;
    }

    const map = mainMap.getMap();
    const canvas = map.getCanvas();

    const onMouseDown = (event: MapLayerMouseEvent) => {
      if (savingRef.current || event.originalEvent.button !== 0) {
        return;
      }

      event.preventDefault();
      draggingRef.current = true;
      dragOffsetRef.current = {
        lat: currentPositionRef.current.lat - event.lngLat.lat,
        lon: currentPositionRef.current.lon - event.lngLat.lng,
      };
      map.dragPan.disable();
      canvas.style.cursor = 'grabbing';
    };

    const onMouseMove = (event: MapMouseEvent) => {
      if (!draggingRef.current) {
        return;
      }

      setCurrentPosition({
        lat: event.lngLat.lat + dragOffsetRef.current.lat,
        lon: event.lngLat.lng + dragOffsetRef.current.lon,
      });
    };

    const onMouseUp = () => {
      endDrag();
    };

    const onMouseEnter = () => {
      if (!draggingRef.current) {
        canvas.style.cursor = 'grab';
      }
    };

    const onMouseLeave = () => {
      if (!draggingRef.current) {
        canvas.style.cursor = '';
      }
    };

    for (const layer of GHOST_LAYERS) {
      map.on('mousedown', layer, onMouseDown);
      map.on('mouseenter', layer, onMouseEnter);
      map.on('mouseleave', layer, onMouseLeave);
    }

    map.on('mousemove', onMouseMove);
    map.on('mouseup', onMouseUp);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onMouseUp);

    return () => {
      for (const layer of GHOST_LAYERS) {
        map.off('mousedown', layer, onMouseDown);
        map.off('mouseenter', layer, onMouseEnter);
        map.off('mouseleave', layer, onMouseLeave);
      }

      map.off('mousemove', onMouseMove);
      map.off('mouseup', onMouseUp);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onMouseUp);
      map.dragPan.enable();
      canvas.style.cursor = '';
    };
  }, [endDrag, mainMap]);

  useEffect(() => {
    if (!mainMap) {
      return;
    }

    const onMapContextMenu = (event: MapMouseEvent) => {
      const features = mainMap.queryRenderedFeatures(event.point, {
        layers: GHOST_LAYERS,
      });

      if (features.length > 0) {
        void commitRef.current?.();
      } else {
        onCancelRef.current();
      }
    };

    mainMap.on('contextmenu', onMapContextMenu);

    return () => {
      mainMap.off('contextmenu', onMapContextMenu);
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

  return (
    <>
      <Source type="geojson" data={ghostFeature}>
        <Layer
          id={GHOST_FILL_LAYER}
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
      <Source type="geojson" data={ghostCenterFeature}>
        <Layer
          id={GHOST_CENTER_LAYER}
          type="circle"
          paint={{
            'circle-color': 'rgba(31, 77, 19, 0.55)',
            'circle-radius': 4,
            'circle-stroke-color': 'rgba(255, 255, 255, 0.9)',
            'circle-stroke-width': 1,
          }}
        />
        <Layer
          id={GHOST_LABEL_LAYER}
          type="symbol"
          layout={{
            'text-allow-overlap': true,
            'text-field': ['get', 'code'],
            'text-offset': [0, 1.1],
            visibility: showLabels ? 'visible' : 'none',
          }}
          paint={{
            'text-color': '#1f4d13',
            'text-opacity': ['step', ['zoom'], 0, 19, 1],
            'text-halo-color': mapBackgroundColor,
            'text-halo-width': 2,
          }}
        />
      </Source>
    </>
  );
};

export default PlantMoveGhost;
