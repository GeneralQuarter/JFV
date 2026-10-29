import type { PageAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
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
import type { LatLon } from '../../lib/geo';
import { closeRing, translateCoords } from '../../lib/geo';
import {
  setLocalCoords,
  updateMapZoneCoords,
  updateRectangleCoords,
} from '../../lib/mutations/shape-actions';
import { mapBackgroundColor } from '../../theme';

export type ShapeKind = 'rectangle' | 'mapZone';

const GHOST_FILL_LAYER = 'shape-move-ghost';
const GHOST_LABEL_LAYER = 'shape-move-ghost-label';
const GHOST_LAYERS = [GHOST_FILL_LAYER, GHOST_LABEL_LAYER];

const SHAPE_STYLES: Record<
  ShapeKind,
  { fill: string; line: string; text: string }
> = {
  rectangle: {
    fill: 'rgba(232, 163, 61, 0.28)',
    line: '#c47f12',
    text: '#8a5a0a',
  },
  mapZone: {
    fill: 'rgba(60, 130, 196, 0.2)',
    line: '#3c82c4',
    text: '#245b8c',
  },
};

type ShapeMoveGhostProps = {
  id: string;
  kind: ShapeKind;
  label: string;
  coords: LatLon[];
  onDone: () => void;
  onCancel: () => void;
};

const ShapeMoveGhost: FC<ShapeMoveGhostProps> = ({
  id,
  kind,
  label,
  coords,
  onDone,
  onCancel,
}) => {
  const sdk = useSDK<PageAppSDK>();
  const { current: mainMap } = useMap();
  const updateEntry = useEntries((state) => state.updateEntry);
  const [delta, setDelta] = useState({ lat: 0, lon: 0 });
  const [saving, setSaving] = useState(false);
  const deltaRef = useRef(delta);
  const savingRef = useRef(saving);
  const draggingRef = useRef(false);
  const dragStartRef = useRef<
    | {
        lat: number;
        lon: number;
        baseLat: number;
        baseLon: number;
      }
    | undefined
  >(undefined);
  const onCancelRef = useRef(onCancel);
  const commitRef = useRef<(() => Promise<void>) | undefined>(undefined);

  deltaRef.current = delta;
  savingRef.current = saving;
  onCancelRef.current = onCancel;

  const ghostFeature = useMemo<Feature<Polygon>>(
    () => ({
      type: 'Feature',
      properties: { label },
      geometry: {
        type: 'Polygon',
        coordinates: [closeRing(translateCoords(coords, delta))],
      },
    }),
    [coords, delta, label],
  );

  const endDrag = useCallback(() => {
    if (!draggingRef.current) {
      return;
    }

    draggingRef.current = false;
    dragStartRef.current = undefined;

    if (mainMap) {
      const map = mainMap.getMap();
      map.dragPan.enable();
      map.getCanvas().style.cursor = '';
    }
  }, [mainMap]);

  const commitShape = useCallback(async () => {
    if (savingRef.current) {
      return;
    }

    setSaving(true);
    endDrag();

    const nextCoords = translateCoords(coords, deltaRef.current);

    try {
      if (kind === 'rectangle') {
        await updateRectangleCoords(sdk.cma, id, nextCoords);
      } else {
        await updateMapZoneCoords(sdk.cma, id, nextCoords);
      }

      updateEntry(id, (entry) => setLocalCoords(entry, nextCoords));
      sdk.notifier.success(
        kind === 'rectangle' ? 'Rectangle moved' : 'Zone moved',
      );
      onDone();
    } catch (error) {
      console.error('Shape position update failed', error);
      sdk.notifier.error('Could not move this shape.');
      setSaving(false);
    }
  }, [coords, endDrag, id, kind, onDone, sdk, updateEntry]);

  commitRef.current = commitShape;

  useEffect(() => {
    if (!mainMap) {
      return;
    }

    const map = mainMap.getMap();
    const canvas = map.getCanvas();

    const onMouseDown = (event: MapLayerMouseEvent) => {
      if (
        savingRef.current ||
        event.originalEvent.button !== 0 ||
        draggingRef.current
      ) {
        return;
      }

      event.preventDefault();
      draggingRef.current = true;
      dragStartRef.current = {
        lat: event.lngLat.lat,
        lon: event.lngLat.lng,
        baseLat: deltaRef.current.lat,
        baseLon: deltaRef.current.lon,
      };
      map.dragPan.disable();
      canvas.style.cursor = 'grabbing';
    };

    const onMouseMove = (event: MapMouseEvent) => {
      const start = dragStartRef.current;

      if (!draggingRef.current || !start) {
        return;
      }

      setDelta({
        lat: start.baseLat + (event.lngLat.lat - start.lat),
        lon: start.baseLon + (event.lngLat.lng - start.lon),
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

    const map = mainMap.getMap();

    const onMapContextMenu = (event: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(event.point, {
        layers: GHOST_LAYERS,
      });

      if (features.length > 0) {
        void commitRef.current?.();
      } else {
        onCancelRef.current();
      }
    };

    map.on('contextmenu', onMapContextMenu);

    return () => {
      map.off('contextmenu', onMapContextMenu);
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

  const style = SHAPE_STYLES[kind];

  return (
    <Source type="geojson" data={ghostFeature}>
      <Layer
        id={GHOST_FILL_LAYER}
        type="fill"
        paint={{
          'fill-color': style.fill,
          'fill-opacity': saving ? 0.4 : 1,
        }}
      />
      <Layer
        type="line"
        paint={{
          'line-color': style.line,
          'line-dasharray': [3, 2],
          'line-width': 2,
        }}
      />
      <Layer
        id={GHOST_LABEL_LAYER}
        type="symbol"
        layout={{
          'text-allow-overlap': true,
          'text-field': ['get', 'label'],
          'text-size': 12,
        }}
        paint={{
          'text-color': style.text,
          'text-halo-color': mapBackgroundColor,
          'text-halo-width': 2,
        }}
      />
    </Source>
  );
};

export default ShapeMoveGhost;
