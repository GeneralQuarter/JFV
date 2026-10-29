import circle from '@turf/circle';
import type { FeatureCollection } from 'geojson';
import { type FC, useEffect } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

type CurrentPositionProps = {
  currentCoords: GeolocationCoordinates;
};

const currentCoordsToFeatureCollection = (
  currentCoords: GeolocationCoordinates,
): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: [
      circle(
        [currentCoords.longitude, currentCoords.latitude],
        currentCoords.accuracy / 1000,
        { properties: { id: 'accuracy' } },
      ),
      circle([currentCoords.longitude, currentCoords.latitude], 0.0005, {
        properties: { id: 'center' },
      }),
    ],
  };
};

const CurrentPosition: FC<CurrentPositionProps> = ({ currentCoords }) => {
  const currentCoordsFeatureCollection =
    currentCoordsToFeatureCollection(currentCoords);

  useEffect(() => {
    console.log(currentCoords);
  }, [currentCoords]);

  return (
    <Source type="geojson" data={currentCoordsFeatureCollection}>
      <Layer
        type="fill"
        paint={{
          'fill-color': 'blue',
          'fill-opacity': 0.3,
        }}
        filter={['==', 'id', 'accuracy']}
      />
      <Layer
        type="fill"
        paint={{
          'fill-color': 'blue',
        }}
        filter={['==', 'id', 'center']}
      />
    </Source>
  );
};

export default CurrentPosition;
