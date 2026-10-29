import type { Feature, FeatureCollection, Point } from 'geojson';
import type { MapMouseEvent } from 'maplibre-gl';
import { type FC, useEffect, useMemo } from 'react';
import { Layer, Source, useMap } from 'react-map-gl/maplibre';
import useSectorDrawing from '../../hooks/useSectorDrawing';
import { closeRing } from '../../lib/geo';

const SectorDraft: FC = () => {
  const { current: mainMap } = useMap();
  const isDrawing = useSectorDrawing((state) => state.isDrawing);
  const vertices = useSectorDrawing((state) => state.vertices);
  const addVertex = useSectorDrawing((state) => state.addVertex);

  useEffect(() => {
    if (!mainMap || !isDrawing) {
      return;
    }

    const map = mainMap.getMap();
    const canvas = map.getCanvas();
    const onClick = (event: MapMouseEvent) => {
      addVertex([event.lngLat.lat, event.lngLat.lng]);
    };

    canvas.style.cursor = 'crosshair';
    map.on('click', onClick);

    return () => {
      map.off('click', onClick);
      canvas.style.cursor = '';
    };
  }, [addVertex, isDrawing, mainMap]);

  const draftFeatures = useMemo<FeatureCollection>(() => {
    const features: Feature[] = [];

    if (vertices.length >= 3) {
      features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [closeRing(vertices)],
        },
      });
    } else if (vertices.length === 2) {
      features.push({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: vertices.map(([lat, lon]) => [lon, lat]),
        },
      });
    }

    return { type: 'FeatureCollection', features };
  }, [vertices]);

  const vertexFeatures = useMemo<FeatureCollection<Point>>(
    () => ({
      type: 'FeatureCollection',
      features: vertices.map(([lat, lon]) => ({
        type: 'Feature',
        properties: {},
        geometry: { type: 'Point', coordinates: [lon, lat] },
      })),
    }),
    [vertices],
  );

  if (!isDrawing) {
    return null;
  }

  return (
    <>
      <Source type="geojson" data={draftFeatures}>
        <Layer
          type="fill"
          paint={{
            'fill-color': '#7a5fa8',
            'fill-opacity': 0.15,
          }}
        />
        <Layer
          type="line"
          paint={{
            'line-color': '#7a5fa8',
            'line-dasharray': [4, 2],
            'line-width': 2,
          }}
        />
      </Source>
      <Source type="geojson" data={vertexFeatures}>
        <Layer
          id="sector-draft-points"
          type="circle"
          paint={{
            'circle-color': '#7a5fa8',
            'circle-radius': 4,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 1.5,
          }}
        />
      </Source>
    </>
  );
};

export default SectorDraft;
