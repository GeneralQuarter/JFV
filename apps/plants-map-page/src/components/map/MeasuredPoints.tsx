import type { PageAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { MAP_LAYER_IDS } from '@jfv/map-data';
import type { FeatureCollection, Point } from 'geojson';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { type FC, useEffect, useMemo, useRef } from 'react';
import { Layer, Source, useMap } from 'react-map-gl/maplibre';
import useEntries from '../../hooks/useEntries';
import useMapSelection from '../../hooks/useMapSelection';
import useMeasuredPoints from '../../hooks/useMeasuredPoints';
import { entryCode } from '../../lib/entries';
import {
  setLocalPlantPosition,
  updatePlantPosition,
} from '../../lib/mutations/plant-actions';
import { coordsToJsonText, pointToCopyText } from '../../lib/points';
import { mapBackgroundColor } from '../../theme';

type MeasuredPointProperties = {
  color: string;
  index: number;
  label: string;
};

const MEASURED_POINT_LAYERS = [
  MAP_LAYER_IDS.measuredPoint,
  MAP_LAYER_IDS.measuredPointLabel,
];

const MeasuredPoints: FC = () => {
  const sdk = useSDK<PageAppSDK>();
  const { current: mainMap } = useMap();
  const plants = useEntries((state) => state.plants);
  const updatePlant = useEntries((state) => state.updatePlant);
  const selectedFeatures = useMapSelection((state) => state.selectedFeatures);
  const points = useMeasuredPoints((state) => state.points);
  const busyRef = useRef(false);

  const featureCollection = useMemo<
    FeatureCollection<Point, MeasuredPointProperties>
  >(
    () => ({
      type: 'FeatureCollection',
      features: points.map((point, index) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [point.coords.lon, point.coords.lat],
        },
        properties: {
          color: point.height > 10 ? '#e07b1f' : '#2f6fbf',
          index,
          label: `${point.name} · ${point.height.toFixed(3)} m`,
        },
      })),
    }),
    [points],
  );

  useEffect(() => {
    if (!mainMap) {
      return;
    }

    const map = mainMap.getMap();

    const onPointClick = async (event: MapLayerMouseEvent) => {
      const index = event.features?.[0]?.properties.index;
      const point = typeof index === 'number' ? points[index] : undefined;
      const original = event.originalEvent;

      if (!point || busyRef.current) {
        return;
      }

      if (!original.ctrlKey && !original.metaKey) {
        return;
      }

      event.preventDefault();
      busyRef.current = true;

      try {
        const selectedPlantId = selectedFeatures.find(
          (feature) => feature.type === 'plant',
        )?.id;
        const plant = selectedPlantId
          ? plants.find((candidate) => candidate.sys.id === selectedPlantId)
          : undefined;
        let moved = false;

        if (plant) {
          try {
            await updatePlantPosition(sdk.cma, plant.sys.id, point.coords);
            updatePlant(plant.sys.id, (entry) =>
              setLocalPlantPosition(entry, point.coords),
            );
            moved = true;
          } catch (error) {
            console.error('Point assignment failed', error);
            sdk.notifier.error('Could not move the plant to that point.');
          }
        }

        const useGrouped = original.shiftKey && Boolean(point.description);
        const grouped = useGrouped
          ? points.filter(
              (candidate) => candidate.description === point.description,
            )
          : [point];
        const text = useGrouped
          ? coordsToJsonText(grouped)
          : pointToCopyText(point);

        try {
          await navigator.clipboard.writeText(text);

          if (moved && plant) {
            sdk.notifier.success(
              `Plant ${entryCode(plant)} moved; coordinates copied.`,
            );
          } else if (plant) {
            sdk.notifier.success('Coordinates copied.');
          } else {
            sdk.notifier.success(
              'Coordinates copied. Select a plant first to assign the point.',
            );
          }
        } catch (error) {
          console.error('Clipboard write failed', error);

          if (moved && plant) {
            sdk.notifier.success(`Plant ${entryCode(plant)} moved.`);
          } else {
            sdk.notifier.error('Could not copy the coordinates.');
          }
        }
      } finally {
        busyRef.current = false;
      }
    };

    for (const layer of MEASURED_POINT_LAYERS) {
      map.on('click', layer, onPointClick);
    }

    return () => {
      for (const layer of MEASURED_POINT_LAYERS) {
        map.off('click', layer, onPointClick);
      }
    };
  }, [mainMap, plants, points, sdk, selectedFeatures, updatePlant]);

  if (points.length === 0) {
    return null;
  }

  return (
    <Source type="geojson" data={featureCollection}>
      <Layer
        id={MAP_LAYER_IDS.measuredPoint}
        type="circle"
        paint={{
          'circle-color': ['get', 'color'],
          'circle-radius': 5,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.5,
        }}
      />
      <Layer
        id={MAP_LAYER_IDS.measuredPointLabel}
        type="symbol"
        layout={{
          'text-field': ['get', 'label'],
          'text-offset': [0, 1.2],
          'text-optional': true,
          'text-size': 11,
        }}
        paint={{
          'text-color': '#1f2933',
          'text-halo-color': mapBackgroundColor,
          'text-halo-width': 2,
        }}
      />
    </Source>
  );
};

export default MeasuredPoints;
