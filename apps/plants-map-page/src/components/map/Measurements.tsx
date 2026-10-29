import type { PageAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { MAP_LAYER_IDS } from '@jfv/map-data';
import { t } from '@lingui/core/macro';
import type { Feature, FeatureCollection, LineString, Point } from 'geojson';
import type { MapLayerMouseEvent } from 'maplibre-gl';
import { type FC, useEffect, useMemo } from 'react';
import { Layer, Source, useMap } from 'react-map-gl/maplibre';
import useMeasurementGraph from '../../hooks/useMeasurementGraph';
import { distanceMeters } from '../../lib/geo';
import { mapBackgroundColor } from '../../theme';

type LineProperties = {
  aId: string;
  bId: string;
  distance: string;
};

type LabelProperties = {
  aId: string;
  bId: string;
  label: string;
};

const MEASUREMENT_LAYERS = [MAP_LAYER_IDS.measure, MAP_LAYER_IDS.measureLabel];

const Measurements: FC = () => {
  const sdk = useSDK<PageAppSDK>();
  const { current: mainMap } = useMap();
  const graph = useMeasurementGraph((state) => state.graph);
  const removeMeasurement = useMeasurementGraph(
    (state) => state.removeMeasurement,
  );

  const { labels, lines } = useMemo(() => {
    const lines: Feature<LineString, LineProperties>[] = [];
    const labels: Feature<Point, LabelProperties>[] = [];

    for (const [aId, bId] of graph.edges) {
      const a = graph.nodes[aId];
      const b = graph.nodes[bId];

      if (!a || !b) {
        continue;
      }

      const distance = distanceMeters(a.position, b.position);
      const label = `${distance.toFixed(2)} m`;

      lines.push({
        type: 'Feature',
        properties: { aId, bId, distance: label },
        geometry: {
          type: 'LineString',
          coordinates: [
            [a.position[1], a.position[0]],
            [b.position[1], b.position[0]],
          ],
        },
      });
      labels.push({
        type: 'Feature',
        properties: { aId, bId, label },
        geometry: {
          type: 'Point',
          coordinates: [
            (a.position[1] + b.position[1]) / 2,
            (a.position[0] + b.position[0]) / 2,
          ],
        },
      });
    }

    return { labels, lines };
  }, [graph]);

  useEffect(() => {
    if (!mainMap) {
      return;
    }

    const map = mainMap.getMap();
    const canvas = map.getCanvas();

    const onClick = (event: MapLayerMouseEvent) => {
      const properties = event.features?.[0]?.properties;

      if (
        typeof properties?.aId !== 'string' ||
        typeof properties?.bId !== 'string'
      ) {
        return;
      }

      removeMeasurement([properties.aId, properties.bId]);
      sdk.notifier.success(t`Measurement removed.`);
    };

    const onMouseEnter = () => {
      canvas.style.cursor = 'pointer';
    };

    const onMouseLeave = () => {
      canvas.style.cursor = '';
    };

    for (const layer of MEASUREMENT_LAYERS) {
      map.on('click', layer, onClick);
      map.on('mouseenter', layer, onMouseEnter);
      map.on('mouseleave', layer, onMouseLeave);
    }

    return () => {
      for (const layer of MEASUREMENT_LAYERS) {
        map.off('click', layer, onClick);
        map.off('mouseenter', layer, onMouseEnter);
        map.off('mouseleave', layer, onMouseLeave);
      }

      canvas.style.cursor = '';
    };
  }, [mainMap, removeMeasurement, sdk]);

  if (graph.edges.length === 0) {
    return null;
  }

  const lineData: FeatureCollection<LineString, LineProperties> = {
    type: 'FeatureCollection',
    features: lines,
  };
  const labelData: FeatureCollection<Point, LabelProperties> = {
    type: 'FeatureCollection',
    features: labels,
  };

  return (
    <>
      <Source type="geojson" data={lineData}>
        <Layer
          id={MAP_LAYER_IDS.measure}
          type="line"
          paint={{
            'line-color': '#7a5fa8',
            'line-dasharray': [3, 2],
            'line-width': 1.5,
          }}
        />
      </Source>
      <Source type="geojson" data={labelData}>
        <Layer
          id={MAP_LAYER_IDS.measureLabel}
          type="symbol"
          layout={{
            'text-field': ['get', 'label'],
            'text-offset': [0, -0.9],
            'text-optional': true,
            'text-size': 11,
          }}
          paint={{
            'text-color': '#4e3a70',
            'text-halo-color': mapBackgroundColor,
            'text-halo-width': 2,
          }}
        />
      </Source>
    </>
  );
};

export default Measurements;
