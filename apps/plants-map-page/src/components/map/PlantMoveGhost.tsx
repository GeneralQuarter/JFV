import type { PageAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import circle from '@turf/circle';
import type { Feature, Polygon } from 'geojson';
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
const GHOST_LABEL_LAYER = 'plant-move-ghost-label';
const GHOST_LAYERS = [GHOST_FILL_LAYER, GHOST_LABEL_LAYER];

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
  const { mainMap } = useMap();
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

  const endDrag = useCallback(() => {
    if (!draggingRef.current) {
      return;
    }

    draggingRef.current = false;
    mainMap?.dragPan.enable();

    if (mainMap) {
      mainMap.getCanvas().style.cursor = '';
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

    const canvas = mainMap.getCanvas();

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
      mainMap.dragPan.disable();
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
      mainMap.on('mousedown', layer, onMouseDown);
      mainMap.on('mouseenter', layer, onMouseEnter);
      mainMap.on('mouseleave', layer, onMouseLeave);
    }

    mainMap.on('mousemove', onMouseMove);
    mainMap.on('mouseup', onMouseUp);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('blur', onMouseUp);

    return () => {
      for (const layer of GHOST_LAYERS) {
        mainMap.off('mousedown', layer, onMouseDown);
        mainMap.off('mouseenter', layer, onMouseEnter);
        mainMap.off('mouseleave', layer, onMouseLeave);
      }

      mainMap.off('mousemove', onMouseMove);
      mainMap.off('mouseup', onMouseUp);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('blur', onMouseUp);
      mainMap.dragPan.enable();
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
      <Layer
        id={GHOST_LABEL_LAYER}
        type="symbol"
        layout={{
          'text-field': ['get', 'code'],
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
  );
};

export default PlantMoveGhost;
