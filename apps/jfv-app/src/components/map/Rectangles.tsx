import type { FeatureCollection } from 'geojson';
import { type FC, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import type { Rectangle } from '../../lib/db/entities/rectangle';

type RectanglesProps = {
  rectangles: Rectangle[] | undefined;
};

const rectanglesToFeatureCollection = (
  rectangles: Rectangle[],
): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: rectangles.map((rectangle) => ({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          rectangle.coords?.map((coords) => [coords[1], coords[0]]) ?? [],
        ],
      },
      properties: {},
    })),
  };
};

const Rectangles: FC<RectanglesProps> = ({ rectangles }) => {
  const rectangleFeatureCollection = useMemo(
    () => rectanglesToFeatureCollection(rectangles ?? []),
    [rectangles],
  );

  return (
    <Source type="geojson" data={rectangleFeatureCollection}>
      <Layer
        type="fill"
        paint={{
          'fill-color': 'orange',
          'fill-opacity': 0.3,
        }}
      />
    </Source>
  );
};

export default Rectangles;
