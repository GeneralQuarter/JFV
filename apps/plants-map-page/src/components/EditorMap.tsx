import type {
  MapGeoJSONFeature,
  MapLayerMouseEvent,
  StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { type FC, useCallback } from 'react';
import { Map as MapLibreMap, type ViewState } from 'react-map-gl/maplibre';
import useMapSelection from '../hooks/useMapSelection';
import { mapBackgroundColor } from '../theme';
import Plants from './map/Plants';
import StaticFeatures from './map/StaticFeatures';

const interactiveLayerIds = ['plant'];

type EditorMapProps = {};

const mapStyle: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': mapBackgroundColor },
    },
  ],
};

const initialViewState: Partial<ViewState> = {
  longitude: 0.88279,
  latitude: 46.37926,
  zoom: 17,
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

const EditorMap: FC<EditorMapProps> = () => {
  const hover = useMapSelection((state) => state.hover);
  const clearHovered = useMapSelection((state) => state.clearHovered);
  const toggleSelect = useMapSelection((state) => state.toggleSelect);

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
    >
      <StaticFeatures />
      <Plants />
    </MapLibreMap>
  );
};

export default EditorMap;
