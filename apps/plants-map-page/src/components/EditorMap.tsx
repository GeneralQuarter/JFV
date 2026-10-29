import { createMapStyle, MAP_LAYER_IDS, mapDefaults } from '@jfv/map-data';
import type { MapGeoJSONFeature, MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { type FC, useCallback, useState } from 'react';
import { Map as MapLibreMap, type ViewState } from 'react-map-gl/maplibre';
import useEntries from '../hooks/useEntries';
import useMapSelection from '../hooks/useMapSelection';
import { entryCode, plantCardId, plantPosition } from '../lib/entries';
import { mapBackgroundColor } from '../theme';
import Hedges from './map/Hedges';
import MapSectors from './map/MapSectors';
import MapZones from './map/MapZones';
import PlantMoveGhost from './map/PlantMoveGhost';
import Plants from './map/Plants';
import Rectangles from './map/Rectangles';
import StaticFeatures from './map/StaticFeatures';

type MovingPlant = {
  id: string;
  code: string;
  position: { lat: number; lon: number };
  diameter: number;
};

const GHOST_LAYER_ID = 'plant-move-ghost';
const interactiveLayerIds = [MAP_LAYER_IDS.plant, GHOST_LAYER_ID];

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
  const hover = useMapSelection((state) => state.hover);
  const clearHovered = useMapSelection((state) => state.clearHovered);
  const toggleSelect = useMapSelection((state) => state.toggleSelect);
  const [movingPlant, setMovingPlant] = useState<MovingPlant>();

  const onMouseMove = useCallback(
    (e: MapLayerMouseEvent) => {
      const smallestFeature = getSmallestFeature(e.features);

      if (smallestFeature?.properties?.id) {
        hover(smallestFeature.properties.id);
      }
    },
    [hover],
  );

  const onMouseLeave = useCallback(() => {
    clearHovered();
  }, [clearHovered]);

  const onClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const smallestFeature = getSmallestFeature(e.features);

      if (!smallestFeature) {
        return;
      }

      const { id, type } = smallestFeature.properties;

      if (typeof id === 'string' && typeof type === 'string') {
        toggleSelect({ id, type }, !e.originalEvent.ctrlKey);
      }
    },
    [toggleSelect],
  );

  const onContextMenu = useCallback(
    (e: MapLayerMouseEvent) => {
      e.originalEvent.preventDefault();

      if (movingPlant) {
        setMovingPlant(undefined);
        return;
      }

      const firstFeature = e.features?.[0];

      if (firstFeature?.layer.id === GHOST_LAYER_ID) {
        return;
      }

      if (
        !firstFeature ||
        firstFeature.layer.id !== MAP_LAYER_IDS.plant ||
        typeof firstFeature.properties.id !== 'string'
      ) {
        return;
      }

      const plant = plants.find(
        (candidate) => candidate.sys.id === firstFeature.properties.id,
      );
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
    [movingPlant, plantCards, plants],
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
      <StaticFeatures />
      <Rectangles />
      <Hedges />
      <MapZones />
      <MapSectors />
      <Plants />
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
    </MapLibreMap>
  );
};

export default EditorMap;
