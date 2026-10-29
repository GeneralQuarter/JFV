import { MAP_LAYER_IDS } from '@jfv/map-data';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { type FC, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import useEntries from '../../hooks/useEntries';
import useVisibilityToggles from '../../hooks/useVisibilityToggles';
import { entryCoords, entryName } from '../../lib/entries';

type ZoneProperties = {
  id: string;
  type: 'mapZone';
  name: string;
};

function closeRing(coords: [lat: number, lon: number][]): [number, number][] {
  const ring: [number, number][] = coords.map(([lat, lon]) => [lon, lat]);
  const first = ring[0];
  const last = ring[ring.length - 1];

  if (first && last && (first[0] !== last[0] || first[1] !== last[1])) {
    ring.push(first);
  }

  return ring;
}

const MapZones: FC = () => {
  const mapZones = useEntries((state) => state.mapZones);
  const showZones = useVisibilityToggles((state) => state.zones);

  const featureCollection = useMemo<FeatureCollection<Polygon, ZoneProperties>>(
    () => ({
      type: 'FeatureCollection',
      features: mapZones.flatMap((zone) => {
        const coords = entryCoords(zone);

        if (!coords || coords.length < 3) {
          return [];
        }

        return [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [closeRing(coords)],
            },
            properties: {
              id: zone.sys.id,
              type: 'mapZone',
              name: entryName(zone),
            },
          } satisfies Feature<Polygon, ZoneProperties>,
        ];
      }),
    }),
    [mapZones],
  );

  if (!showZones) {
    return null;
  }

  return (
    <Source type="geojson" data={featureCollection}>
      <Layer
        id={MAP_LAYER_IDS.mapZone}
        type="fill"
        paint={{
          'fill-color': '#3c82c4',
          'fill-opacity': 0.12,
        }}
      />
      <Layer
        type="line"
        paint={{
          'line-color': '#3c82c4',
          'line-dasharray': [4, 2],
          'line-width': 2,
        }}
      />
      <Layer
        type="symbol"
        layout={{
          'text-field': ['get', 'name'],
          'text-size': 12,
        }}
        paint={{
          'text-color': '#245b8c',
          'text-halo-color': '#fffbec',
          'text-halo-width': 2,
        }}
      />
    </Source>
  );
};

export default MapZones;
