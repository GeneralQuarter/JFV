export type LatLon = [lat: number, lon: number];

export function closeRing(coords: LatLon[]): [number, number][] {
  const ring: [number, number][] = coords.map(([lat, lon]) => [lon, lat]);
  const first = ring[0];
  const last = ring[ring.length - 1];

  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
    ring.push(first);
  }

  return ring;
}

export function translateCoords(
  coords: LatLon[],
  delta: { lat: number; lon: number },
): LatLon[] {
  return coords.map(([lat, lon]) => [lat + delta.lat, lon + delta.lon]);
}

export function coordsCenter(coords: LatLon[]): { lat: number; lon: number } {
  const first = coords[0];
  const last = coords[coords.length - 1];
  const isClosed =
    coords.length > 1 && first[0] === last[0] && first[1] === last[1];
  const points = isClosed ? coords.slice(0, -1) : coords;
  const [latSum, lonSum] = points.reduce(
    ([lat, lon], point) => [lat + point[0], lon + point[1]],
    [0, 0],
  );

  return { lat: latSum / points.length, lon: lonSum / points.length };
}

export function distanceMeters(a: LatLon, b: LatLon): number {
  const earthRadius = 6371008.8;
  const toRadians = Math.PI / 180;
  const lat1 = a[0] * toRadians;
  const lat2 = b[0] * toRadians;
  const deltaLat = (b[0] - a[0]) * toRadians;
  const deltaLon = (b[1] - a[1]) * toRadians;
  const sinLat = Math.sin(deltaLat / 2);
  const sinLon = Math.sin(deltaLon / 2);
  const h = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

export function rotateCoords(
  coords: LatLon[],
  center: { lat: number; lon: number },
  radians: number,
): LatLon[] {
  const cosLat = Math.cos((center.lat * Math.PI) / 180);
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);

  return coords.map(([lat, lon]) => {
    const x = (lon - center.lon) * cosLat;
    const y = lat - center.lat;
    const rotatedX = x * cos - y * sin;
    const rotatedY = x * sin + y * cos;

    return [center.lat + rotatedY, center.lon + rotatedX / cosLat];
  });
}
