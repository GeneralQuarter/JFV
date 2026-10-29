import tokens from '@contentful/f36-tokens';
import { staticMapFeatureCollection } from '@jfv/map-data';
import type { FC } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

const StaticFeatures: FC = () => {
  return (
    <Source type="geojson" data={staticMapFeatureCollection}>
      <Layer
        type="fill"
        paint={{ 'fill-color': tokens.blue300 }}
        filter={['==', 'id', 'gartempe']}
      />
      <Layer
        type="line"
        paint={{ 'line-color': 'gray' }}
        filter={['==', 'id', 'terrain']}
      />
      <Layer
        type="line"
        paint={{ 'line-color': 'gray' }}
        filter={['==', 'id', 'fences']}
      />
      <Layer
        type="line"
        paint={{ 'line-color': 'gray', 'line-dasharray': [2, 2] }}
        filter={['==', 'id', 'doors']}
      />
      <Layer
        type="fill"
        paint={{ 'fill-color': tokens.blue300 }}
        filter={['==', 'id', 'happyLake']}
      />
      <Layer
        type="fill"
        paint={{
          'fill-color': tokens.gray700,
          'fill-outline-color': 'transparent',
        }}
        filter={['==', 'id', 'd116']}
      />
      <Layer
        type="fill"
        paint={{
          'fill-color': 'gray',
          'fill-opacity': 0.3,
          'fill-outline-color': 'transparent',
        }}
        filter={['==', 'id', 'path']}
      />
      <Layer
        type="fill"
        paint={{ 'fill-color': tokens.blue300 }}
        filter={['==', 'id', 'ponds']}
      />
    </Source>
  );
};

export default StaticFeatures;
