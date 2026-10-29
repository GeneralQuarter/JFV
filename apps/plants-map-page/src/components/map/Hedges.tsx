import { MAP_LAYER_IDS, mapDefaults } from '@jfv/map-data';
import type { Feature, FeatureCollection, LineString } from 'geojson';
import type { ExpressionSpecification } from 'maplibre-gl';
import { type FC, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import useEntries from '../../hooks/useEntries';
import { entryCoords, entryName } from '../../lib/entries';

type HedgeProperties = {
  id: string;
  type: 'hedge';
  name: string;
};

const HEDGE_WIDTH_METERS = 1.5;
const ZOOM_STOPS = [12, 14, 16, 18, 20, 22];

const hedgeWidth = (zoom: number) => {
  const metersPerPixel =
    (40075016.686 * Math.cos((mapDefaults.latitude * Math.PI) / 180)) /
    (512 * 2 ** zoom);

  return HEDGE_WIDTH_METERS / metersPerPixel;
};

const HEDGE_WIDTH_EXPRESSION: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  ...ZOOM_STOPS.flatMap((zoom) => [zoom, hedgeWidth(zoom)]),
];

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
          'line-color': 'brown',
          'line-opacity': 0.3,
          'line-width': HEDGE_WIDTH_EXPRESSION,
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
