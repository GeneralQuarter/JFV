import type { LatLngTuple } from '../domain/models';

export function toLngLat([lat, lon]: LatLngTuple): [number, number] {
  return [lon, lat];
}

export function toLatLng([lng, lat]: [number, number]): LatLngTuple {
  return [lat, lng];
}
