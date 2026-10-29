import tokens from '@contentful/f36-tokens';
import { MAP_LAYER_IDS } from '@jfv/map-data';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { type FC, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import useEntries from '../../hooks/useEntries';
import useMapSelection from '../../hooks/useMapSelection';
import { entryCode, entryCoords } from '../../lib/entries';
import { closeRing } from '../../lib/geo';

type RectangleProperties = {
  id: string;
  type: 'rectangle';
  code: string;
};

const Rectangles: FC = () => {
  const rectangles = useEntries((state) => state.rectangles);
  const selectedFeatures = useMapSelection((state) => state.selectedFeatures);

  const featureCollection = useMemo<
    FeatureCollection<Polygon, RectangleProperties>
  >(
    () => ({
      type: 'FeatureCollection',
      features: rectangles.flatMap((rectangle) => {
        const coords = entryCoords(rectangle);

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
              id: rectangle.sys.id,
              type: 'rectangle',
              code: entryCode(rectangle),
            },
          } satisfies Feature<Polygon, RectangleProperties>,
        ];
      }),
    }),
    [rectangles],
  );

  const selectedFeatureCollection = useMemo<
    FeatureCollection<Polygon, RectangleProperties>
  >(
    () => ({
      type: 'FeatureCollection',
      features: featureCollection.features.filter((feature) =>
        selectedFeatures.some(
          (selected) => selected.id === feature.properties.id,
        ),
      ),
    }),
    [featureCollection, selectedFeatures],
  );

  return (
    <>
      <Source type="geojson" data={featureCollection}>
        <Layer
          id={MAP_LAYER_IDS.rectangle}
          type="fill"
          paint={{
            'fill-color': '#e8a33d',
            'fill-opacity': 0.2,
          }}
        />
        <Layer
          type="line"
          paint={{
            'line-color': '#c47f12',
            'line-width': 1,
          }}
        />
        <Layer
          type="symbol"
          layout={{
            'text-field': ['get', 'code'],
            'text-size': 12,
          }}
          paint={{
            'text-color': '#8a5a0a',
            'text-halo-color': '#fffbec',
            'text-halo-width': 2,
          }}
        />
      </Source>
      <Source type="geojson" data={selectedFeatureCollection}>
        <Layer
          type="line"
          paint={{
            'line-color': tokens.colorPrimary,
            'line-width': 3,
          }}
        />
      </Source>
    </>
  );
};

export default Rectangles;
