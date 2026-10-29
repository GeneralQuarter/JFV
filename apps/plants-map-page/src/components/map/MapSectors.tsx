import { MAP_LAYER_IDS } from '@jfv/map-data';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { type FC, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import useEntries from '../../hooks/useEntries';
import useVisibilityToggles from '../../hooks/useVisibilityToggles';
import { entryName, mapSectorGeoJson } from '../../lib/entries';

type SectorProperties = {
  id: string;
  type: 'mapSector';
  name: string;
};

const MapSectors: FC = () => {
  const mapSectors = useEntries((state) => state.mapSectors);
  const showMapSectors = useVisibilityToggles((state) => state.mapSectors);

  const featureCollection = useMemo<
    FeatureCollection<Polygon, SectorProperties>
  >(
    () => ({
      type: 'FeatureCollection',
      features: mapSectors.flatMap((sector) => {
        const geojson = mapSectorGeoJson(sector);

        if (!geojson) {
          return [];
        }

        return [
          {
            ...geojson,
            properties: {
              ...geojson.properties,
              id: sector.sys.id,
              type: 'mapSector',
              name: entryName(sector),
            },
          } satisfies Feature<Polygon, SectorProperties>,
        ];
      }),
    }),
    [mapSectors],
  );

  if (!showMapSectors) {
    return null;
  }

  return (
    <Source type="geojson" data={featureCollection}>
      <Layer
        id={MAP_LAYER_IDS.mapSector}
        type="fill"
        paint={{
          'fill-color': '#7a5fa8',
          'fill-opacity': 0.15,
        }}
      />
      <Layer
        type="line"
        paint={{
          'line-color': '#7a5fa8',
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
          'text-color': '#4e3a70',
          'text-halo-color': '#fffbec',
          'text-halo-width': 2,
        }}
      />
    </Source>
  );
};

export default MapSectors;
