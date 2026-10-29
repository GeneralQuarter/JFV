import type { StyleSpecification } from 'maplibre-gl';

export const mapDefaults = {
  longitude: 0.88279,
  latitude: 46.37926,
  zoom: 17,
} as const;

export const MAP_GLYPHS =
  'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf';

export const MAP_BACKGROUND_COLOR = '#fffbec';

export const MAP_LAYER_IDS = {
  plant: 'plant',
  plantLabel: 'plant-label',
  hedge: 'hedge',
  rectangle: 'rectangle',
  mapZone: 'map-zone',
  mapSector: 'map-sector',
  measuredPoint: 'measured-point',
  measuredPointLabel: 'measured-point-label',
  measure: 'measure',
  measureLabel: 'measure-label',
} as const;

export function createMapStyle(backgroundColor: string): StyleSpecification {
  return {
    version: 8,
    glyphs: MAP_GLYPHS,
    sources: {},
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': backgroundColor },
      },
    ],
  };
}
