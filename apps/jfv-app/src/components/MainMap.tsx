import {
  createMapStyle,
  MAP_BACKGROUND_COLOR,
  mapDefaults,
} from '@jfv/map-data';
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

const mapStyle = createMapStyle(MAP_BACKGROUND_COLOR);

const initialViewState: Partial<ViewState> = {
  longitude: mapDefaults.longitude,
  latitude: mapDefaults.latitude,
  zoom: mapDefaults.zoom,
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
