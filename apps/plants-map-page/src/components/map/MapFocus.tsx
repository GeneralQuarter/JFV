import { type FC, useEffect } from 'react';
import { useMap } from 'react-map-gl/maplibre';
import useMapFocus from '../../hooks/useMapFocus';

const MapFocus: FC = () => {
  const { current: mainMap } = useMap();
  const target = useMapFocus((state) => state.target);
  const clear = useMapFocus((state) => state.clear);

  useEffect(() => {
    if (!mainMap || !target) {
      return;
    }

    mainMap.flyTo({
      center: [target.lon, target.lat],
      duration: 800,
      zoom: target.zoom,
    });
    clear();
  }, [clear, mainMap, target]);

  return null;
};

export default MapFocus;
