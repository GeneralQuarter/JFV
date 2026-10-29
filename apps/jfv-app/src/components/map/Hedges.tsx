import buffer from '@turf/buffer';
import type { FeatureCollection } from 'geojson';
import { type FC, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import type { Hedge } from '../../lib/db/entities/hedge';

type HedgesProps = {
  hedges: Hedge[] | undefined;
};

const hedgesToFeatureCollection = (hedges: Hedge[]): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    // @ts-expect-error feature list with never have an undefined buffer
    features: hedges.map((hedge) => ({
      ...buffer(
        {
          type: 'LineString',
          coordinates:
            hedge.coords?.map((coords) => [coords[1], coords[0]]) ?? [],
        },
        0.8 / 1000,
      ),
      properties: {
        id: hedge.id,
        label: hedge.name,
        color: 'brown',
      },
    })),
  };
};

const Hedges: FC<HedgesProps> = ({ hedges }) => {
  const hedgeFeatureCollection = useMemo(
    () => hedgesToFeatureCollection(hedges ?? []),
    [hedges],
  );

  return (
    <Source type="geojson" data={hedgeFeatureCollection}>
      <Layer
        type="fill"
        paint={{
          'fill-color': ['get', 'color'],
          'fill-opacity': 0.3,
        }}
      />
      <Layer
        type="symbol"
        layout={{
          'text-field': ['get', 'label'],
          'symbol-placement': 'line',
          'text-offset': [0, 1],
          'symbol-spacing': 180,
          'text-allow-overlap': true,
        }}
        paint={{
          'text-color': 'brown',
          'text-opacity': ['step', ['zoom'], 0, 19, 1],
        }}
      />
    </Source>
  );
};

export default Hedges;
