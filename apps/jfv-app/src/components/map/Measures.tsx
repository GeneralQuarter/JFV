import type { MeasureGraph, MeasureNode } from '@jfv/core/geo';
import { MAP_LAYER_IDS } from '@jfv/map-data';
import length from '@turf/length';
import type { Feature, FeatureCollection, LineString } from 'geojson';
import { type FC, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

type MeasureProperties = {
  aId: string;
  bId: string;
  label: string;
};

type MeasuresProps = {
  graph: MeasureGraph;
  startNode?: MeasureNode;
};

const measureGraphToFeatureCollection = (
  graph: MeasureGraph,
): FeatureCollection<LineString, MeasureProperties> => ({
  type: 'FeatureCollection',
  features: graph.edges.map(([aId, bId]) => {
    const a = graph.nodes[aId];
    const b = graph.nodes[bId];
    const feature: Feature<LineString, MeasureProperties> = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [a.position[1], a.position[0]],
          [b.position[1], b.position[0]],
        ],
      },
      properties: {
        aId,
        bId,
        label: '',
      },
    };

    feature.properties.label = `${(length(feature) * 1000).toFixed(1)} m`;

    return feature;
  }),
});

const Measures: FC<MeasuresProps> = ({ graph, startNode }) => {
  const measureFeatureCollection = useMemo(
    () => measureGraphToFeatureCollection(graph),
    [graph],
  );

  const startFeatureCollection: FeatureCollection | undefined = startNode
    ? {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [startNode.position[1], startNode.position[0]],
            },
            properties: {},
          },
        ],
      }
    : undefined;

  return (
    <>
      <Source type="geojson" data={measureFeatureCollection}>
        <Layer
          beforeId={MAP_LAYER_IDS.plantLabel}
          type="line"
          paint={{
            'line-color': 'purple',
            'line-dasharray': [2, 1],
            'line-width': 2,
          }}
        />
        <Layer
          id={MAP_LAYER_IDS.measure}
          type="symbol"
          layout={{
            'symbol-placement': 'line-center',
            'text-field': ['get', 'label'],
            'text-offset': [0, -0.8],
          }}
          paint={{
            'text-color': 'purple',
            'text-halo-color': '#fffbec',
            'text-halo-width': 2,
          }}
        />
      </Source>
      {startFeatureCollection && (
        <Source type="geojson" data={startFeatureCollection}>
          <Layer
            type="circle"
            paint={{
              'circle-color': 'purple',
              'circle-opacity': 0.6,
              'circle-radius': 8,
              'circle-stroke-color': 'white',
              'circle-stroke-width': 2,
            }}
          />
        </Source>
      )}
    </>
  );
};

export default Measures;
