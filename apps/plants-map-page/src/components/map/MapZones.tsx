import tokens from '@contentful/f36-tokens';
import { MAP_LAYER_IDS } from '@jfv/map-data';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { type FC, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import useEntries from '../../hooks/useEntries';
import useMapSelection from '../../hooks/useMapSelection';
import useVisibilityToggles from '../../hooks/useVisibilityToggles';
import { entryCoords, entryName } from '../../lib/entries';
import { closeRing } from '../../lib/geo';

type ZoneProperties = {
  id: string;
  type: 'mapZone';
  name: string;
};

const MapZones: FC = () => {
  const mapZones = useEntries((state) => state.mapZones);
  const showZones = useVisibilityToggles((state) => state.zones);
  const selectedFeatures = useMapSelection((state) => state.selectedFeatures);

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

  const selectedFeatureCollection = useMemo<
    FeatureCollection<Polygon, ZoneProperties>
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

  if (!showZones) {
    return null;
  }

  return (
    <>
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

export default MapZones;
