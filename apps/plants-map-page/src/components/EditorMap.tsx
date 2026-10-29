import { createMapStyle, MAP_LAYER_IDS, mapDefaults } from '@jfv/map-data';
import type { MapGeoJSONFeature, MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { type FC, useCallback, useState } from 'react';
import { Map as MapLibreMap, type ViewState } from 'react-map-gl/maplibre';
import useEntries from '../hooks/useEntries';
import useMapSelection from '../hooks/useMapSelection';
import {
  entryCode,
  entryCoords,
  entryName,
  plantCardId,
  plantPosition,
} from '../lib/entries';
import { mapBackgroundColor } from '../theme';
import Hedges from './map/Hedges';
import MapFocus from './map/MapFocus';
import MapSectors from './map/MapSectors';
import MapView from './map/MapView';
import MapZones from './map/MapZones';
import MeasuredPoints from './map/MeasuredPoints';
import PlantMoveGhost from './map/PlantMoveGhost';
import Plants from './map/Plants';
import Rectangles from './map/Rectangles';
import ShapeMoveGhost, { type ShapeKind } from './map/ShapeMoveGhost';
import StaticFeatures from './map/StaticFeatures';

type MovingPlant = {
  id: string;
  code: string;
  position: { lat: number; lon: number };
  diameter: number;
};

type MovingShape = {
  coords: [lat: number, lon: number][];
  id: string;
  kind: ShapeKind;
  label: string;
};

const interactiveLayerIds = [
  MAP_LAYER_IDS.plant,
  MAP_LAYER_IDS.rectangle,
  MAP_LAYER_IDS.mapZone,
  MAP_LAYER_IDS.measuredPoint,
  MAP_LAYER_IDS.measuredPointLabel,
];

const MEASURED_POINT_LAYERS = [
  MAP_LAYER_IDS.measuredPoint,
  MAP_LAYER_IDS.measuredPointLabel,
];

const isMeasuredPointFeature = (feature: MapGeoJSONFeature) =>
  MEASURED_POINT_LAYERS.some((layerId) => layerId === feature.layer.id);

const mapStyle = createMapStyle(mapBackgroundColor);

const initialViewState: Partial<ViewState> = {
  longitude: mapDefaults.longitude,
  latitude: mapDefaults.latitude,
  zoom: mapDefaults.zoom,
};

const getSmallestFeature = (features?: MapGeoJSONFeature[]) => {
  if (!features || features.length === 0) {
    return;
  }

  const featureSize = (feature: MapGeoJSONFeature): number => {
    if (feature.properties.diameter) {
      return feature.properties.diameter;
    }

    return Infinity;
  };

  return features.reduce((acc, f) => {
    const pSize = featureSize(acc);
    const fSize = featureSize(f);

    return fSize < pSize ? f : acc;
  }, features[0]);
};

const EditorMap: FC = () => {
  const plants = useEntries((state) => state.plants);
  const plantCards = useEntries((state) => state.plantCards);
  const rectangles = useEntries((state) => state.rectangles);
  const mapZones = useEntries((state) => state.mapZones);
  const hover = useMapSelection((state) => state.hover);
  const clearHovered = useMapSelection((state) => state.clearHovered);
  const toggleSelect = useMapSelection((state) => state.toggleSelect);
  const [movingPlant, setMovingPlant] = useState<MovingPlant>();
  const [movingShape, setMovingShape] = useState<MovingShape>();

  const onMouseMove = useCallback(
    (e: MapLayerMouseEvent) => {
      if (movingPlant || movingShape) {
        return;
      }

      const smallestFeature = getSmallestFeature(e.features);
      const { id, type } = smallestFeature?.properties ?? {};

      if (type === 'plant' && typeof id === 'string') {
        hover(id);
      }
    },
    [hover, movingPlant, movingShape],
  );

  const onMouseLeave = useCallback(() => {
    clearHovered();
  }, [clearHovered]);

  const onClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (movingPlant || movingShape) {
        return;
      }

      if (e.features?.some(isMeasuredPointFeature)) {
        return;
      }

      const smallestFeature = getSmallestFeature(e.features);

      if (!smallestFeature) {
        return;
      }

      const { id, type } = smallestFeature.properties;

      if (typeof id === 'string' && type === 'plant') {
        toggleSelect({ id, type }, !e.originalEvent.ctrlKey);
      }
    },
    [movingPlant, movingShape, toggleSelect],
  );

  const onContextMenu = useCallback(
    (e: MapLayerMouseEvent) => {
      e.originalEvent.preventDefault();

      if (movingPlant || movingShape) {
        return;
      }

      const features = e.features ?? [];

      if (features.some(isMeasuredPointFeature)) {
        return;
      }

      const firstFeature =
        features.find((feature) => feature.layer.id === MAP_LAYER_IDS.plant) ??
        features.find(
          (feature) => feature.layer.id === MAP_LAYER_IDS.rectangle,
        ) ??
        features.find((feature) => feature.layer.id === MAP_LAYER_IDS.mapZone);

      if (!firstFeature || typeof firstFeature.properties.id !== 'string') {
        return;
      }

      const featureId = firstFeature.properties.id;

      if (firstFeature.layer.id === MAP_LAYER_IDS.rectangle) {
        const rectangle = rectangles.find(
          (candidate) => candidate.sys.id === featureId,
        );
        const coords = rectangle ? entryCoords(rectangle) : undefined;

        if (rectangle && coords && coords.length >= 3) {
          setMovingShape({
            coords,
            id: rectangle.sys.id,
            kind: 'rectangle',
            label: entryCode(rectangle),
          });
        }

        return;
      }

      if (firstFeature.layer.id === MAP_LAYER_IDS.mapZone) {
        const zone = mapZones.find(
          (candidate) => candidate.sys.id === featureId,
        );
        const coords = zone ? entryCoords(zone) : undefined;

        if (zone && coords && coords.length >= 3) {
          setMovingShape({
            coords,
            id: zone.sys.id,
            kind: 'mapZone',
            label: entryName(zone),
          });
        }

        return;
      }

      if (firstFeature.layer.id !== MAP_LAYER_IDS.plant) {
        return;
      }

      const plant = plants.find((candidate) => candidate.sys.id === featureId);
      const position = plant ? plantPosition(plant) : undefined;

      if (!plant || !position) {
        return;
      }

      const cardId = plantCardId(plant);
      const plantCard = cardId
        ? plantCards.find((card) => card.sys.id === cardId)
        : undefined;

      setMovingPlant({
        code: entryCode(plant),
        diameter: Number(plantCard?.fields.width?.fr ?? 1),
        id: plant.sys.id,
        position,
      });
    },
    [mapZones, movingPlant, movingShape, plantCards, plants, rectangles],
  );

  return (
    <MapLibreMap
      id="mainMap"
      initialViewState={initialViewState}
      attributionControl={false}
      mapStyle={mapStyle}
      interactiveLayerIds={interactiveLayerIds}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <MapFocus />
      <MapView />
      <StaticFeatures />
      <Rectangles />
      <Hedges />
      <MapZones />
      <MapSectors />
      <Plants />
      <MeasuredPoints />
      {movingPlant && (
        <PlantMoveGhost
          key={movingPlant.id}
          code={movingPlant.code}
          diameter={movingPlant.diameter}
          onCancel={() => setMovingPlant(undefined)}
          onDone={() => setMovingPlant(undefined)}
          plantId={movingPlant.id}
          position={movingPlant.position}
        />
      )}
      {movingShape && (
        <ShapeMoveGhost
          key={movingShape.id}
          coords={movingShape.coords}
          id={movingShape.id}
          kind={movingShape.kind}
          label={movingShape.label}
          onCancel={() => setMovingShape(undefined)}
          onDone={() => setMovingShape(undefined)}
        />
      )}
    </MapLibreMap>
  );
};

export default EditorMap;
