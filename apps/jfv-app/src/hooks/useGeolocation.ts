import { useEffect, useState } from 'react';

const options: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 2000,
};

export default function useGeolocation(
  active: boolean,
): GeolocationCoordinates | null {
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);

  useEffect(() => {
    if (!active) {
      setCoords(null);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => setCoords(pos.coords),
      (err) => console.error(err),
      options,
    );

    return () => {
      navigator.geolocation.clearWatch(id);
    };
  }, [active]);

  return coords;
}
