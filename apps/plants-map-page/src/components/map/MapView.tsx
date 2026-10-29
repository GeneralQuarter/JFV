import { type FC, useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import useMapView from '../../hooks/useMapView';

const MapView: FC = () => {
  const { current: mainMap } = useMap();
  const setCenter = useMapView((state) => state.setCenter);

  useEffect(() => {
    if (!mainMap) {
      return;
    }

    const map = mainMap.getMap();
    const update = () => {
      const center = map.getCenter();
      setCenter({ lat: center.lat, lon: center.lng });
    };

    update();
    map.on('moveend', update);

    return () => {
      map.off('moveend', update);
    };
  }, [mainMap, setCenter]);

  return null;
};

export default MapView;
