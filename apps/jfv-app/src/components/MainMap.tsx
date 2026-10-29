import type { StyleSpecification } from 'maplibre-gl';
import { type FC, type PropsWithChildren, useCallback } from 'react';
import {
  type MapLayerMouseEvent,
  Map as MapLibreMap,
  type ViewState,
  type ViewStateChangeEvent,
} from 'react-map-gl/maplibre';

import 'maplibre-gl/dist/maplibre-gl.css';

export type Feature = {
  id: string;
  type: string;
};

type MainMapProps = {
  interactiveLayerIds: string[];
  onFeatureClick: (feature: Feature) => void;
  onBearingChange: (bearing: number) => void;
};

const mapStyle: StyleSpecification = {
  version: 8,
  glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
  sources: {},
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': '#fffbec' },
    },
  ],
};

const initialViewState: Partial<ViewState> = {
  longitude: 0.88279,
  latitude: 46.37926,
  zoom: 17,
};

const MainMap: FC<PropsWithChildren<MainMapProps>> = ({
  children,
  onFeatureClick,
  interactiveLayerIds,
  onBearingChange,
}) => {
  const onClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const firstFeature = e.features?.[0];

      if (firstFeature) {
        onFeatureClick({
          id: firstFeature.properties.id,
          type: firstFeature.layer.id,
        });
      }
    },
    [onFeatureClick],
  );

  const onRotate = useCallback(
    (e: ViewStateChangeEvent) => {
      onBearingChange(e.viewState.bearing);
    },
    [onBearingChange],
  );

  return (
    <MapLibreMap
      id="mainMap"
      initialViewState={initialViewState}
      attributionControl={false}
      mapStyle={mapStyle}
      onClick={onClick}
      interactiveLayerIds={interactiveLayerIds}
      onRotate={onRotate}
    >
      {children}
    </MapLibreMap>
  );
};

export default MainMap;
