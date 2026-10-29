import { MAP_LAYER_IDS } from '@jfv/map-data';
import type { Feature, FeatureCollection, LineString } from 'geojson';
import { type FC, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import useEntries from '../../hooks/useEntries';
import { entryCoords, entryName } from '../../lib/entries';

type HedgeProperties = {
  id: string;
  type: 'hedge';
  name: string;
};

const Hedges: FC = () => {
  const hedges = useEntries((state) => state.hedges);

  const featureCollection = useMemo<
    FeatureCollection<LineString, HedgeProperties>
  >(
    () => ({
      type: 'FeatureCollection',
      features: hedges.flatMap((hedge) => {
        const coords = entryCoords(hedge);

        if (!coords || coords.length < 2) {
          return [];
        }

        return [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coords.map(([lat, lon]) => [lon, lat]),
            },
            properties: {
              id: hedge.sys.id,
              type: 'hedge',
              name: entryName(hedge),
            },
          } satisfies Feature<LineString, HedgeProperties>,
        ];
      }),
    }),
    [hedges],
  );

  return (
    <Source type="geojson" data={featureCollection}>
      <Layer
        id={MAP_LAYER_IDS.hedge}
        type="line"
        paint={{
          'line-color': '#5b8c5a',
          'line-width': 3,
        }}
      />
      <Layer
        id={`${MAP_LAYER_IDS.hedge}-label`}
        type="symbol"
        layout={{
          'symbol-placement': 'line',
          'text-field': ['get', 'name'],
          'text-offset': [0, 1],
          'text-size': 12,
        }}
        paint={{
          'text-color': '#426640',
          'text-halo-color': '#fffbec',
          'text-halo-width': 2,
        }}
      />
    </Source>
  );
};

export default Hedges;
