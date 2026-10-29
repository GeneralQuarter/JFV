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
