import tokens from '@contentful/f36-tokens';
import circle from '@turf/circle';
import type { Feature, FeatureCollection } from 'geojson';
import { type FC, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import useEntries from '../../hooks/useEntries';
import useMapSelection from '../../hooks/useMapSelection';
import useVisibilityToggles from '../../hooks/useVisibilityToggles';
import { mapBackgroundColor } from '../../theme';

type RenderPlant = {
  id: string;
  code: string;
  position: { lat: number; lon: number };
  diameter: number;
  height: number;
  tags: string[];
};

const renderPlantToFeature =
  (showCanopy: boolean) =>
  (plant: RenderPlant): Feature =>
    circle(
      [plant.position.lon, plant.position.lat],
      (showCanopy || plant.diameter < 2 ? plant.diameter : 2) / 2000,
      {
        properties: {
          id: plant.id,
          type: 'plant',
          code: plant.code,
          height: plant.height,
          diameter: plant.diameter,
        },
      },
    );

const renderPlantsToFeatureCollection =
  (showCanopy: boolean) =>
  (renderPlants: RenderPlant[]): FeatureCollection => ({
    type: 'FeatureCollection',
    features: renderPlants.map(renderPlantToFeature(showCanopy)),
  });

const Plants: FC = () => {
  const plants = useEntries((state) => state.plants);
  const plantCards = useEntries((state) => state.plantCards);
  const showCanopy = useVisibilityToggles((state) => state.canopy);
  const showDeadPlants = useVisibilityToggles((state) => state.deadPlants);
  const hoveredId = useMapSelection((state) => state.hoveredId);
  const selectedFeatures = useMapSelection((state) => state.selectedFeatures);

  const renderPlants = useMemo<RenderPlant[]>(() => {
    if (plants.length === 0 || plantCards.length === 0) {
      return [];
    }

    return plants.map((p) => {
      const plantCard = plantCards.find(
        (pc) => pc.sys.id === p.fields.commonInfo.fr.sys.id,
      );

      return {
        id: p.sys.id,
        code: p.fields.code.fr as string,
        position: p.fields.position?.fr as { lat: number; lon: number },
        diameter: (plantCard?.fields.width?.fr ?? 1) as number,
        height: (plantCard?.fields.height?.fr ?? 1) as number,
        tags: (p.metadata?.tags.map((t) => t.sys.id) ?? []).concat(
          plantCard?.metadata?.tags.map((t) => t.sys.id) ?? [],
        ),
      };
    });
  }, [plants, plantCards]);

  const filteredPlants = useMemo<RenderPlant[]>(
    () =>
      showDeadPlants
        ? renderPlants
        : renderPlants.filter((p) => !p.tags.includes('dead')),
    [renderPlants, showDeadPlants],
  );

  const hoveredRenderPlants = useMemo(
    () => filteredPlants.filter((p) => p.id === hoveredId),
    [filteredPlants, hoveredId],
  );

  const selectedRenderPlants = useMemo(
    () =>
      filteredPlants.filter((p) => selectedFeatures.some((s) => s.id === p.id)),
    [filteredPlants, selectedFeatures],
  );

  const plantFeatureCollection = useMemo<FeatureCollection>(
    () => renderPlantsToFeatureCollection(showCanopy)(filteredPlants),
    [filteredPlants, showCanopy],
  );

  const hoveredPlantFeatureCollection = useMemo<FeatureCollection>(
    () => renderPlantsToFeatureCollection(showCanopy)(hoveredRenderPlants),
    [hoveredRenderPlants, showCanopy],
  );

  const selectedPlantFeatureCollection = useMemo<FeatureCollection>(
    () => renderPlantsToFeatureCollection(showCanopy)(selectedRenderPlants),
    [selectedRenderPlants, showCanopy],
  );

  return (
    <>
      <Source type="geojson" data={plantFeatureCollection}>
        <Layer
          type="fill"
          id="plant"
          paint={{
            'fill-color': 'transparent',
          }}
        />
        <Layer type="line" paint={{ 'line-color': 'gray' }}></Layer>
        <Layer
          id="plant-label"
          type="symbol"
          layout={{ 'text-field': ['get', 'code'] }}
          paint={{
            'text-color': tokens.colorBlack,
            'text-opacity': ['step', ['zoom'], 0, 19, 1],
            'text-halo-color': mapBackgroundColor,
            'text-halo-width': 2,
          }}
        />
      </Source>
      <Source type="geojson" data={hoveredPlantFeatureCollection}>
        <Layer
          type="fill"
          beforeId="plant"
          paint={{
            'fill-color': tokens.purple300,
          }}
        ></Layer>
      </Source>
      <Source type="geojson" data={selectedPlantFeatureCollection}>
        <Layer
          type="line"
          beforeId="plant-label"
          paint={{ 'line-color': tokens.colorPrimary, 'line-width': 2 }}
        ></Layer>
      </Source>
    </>
  );
};

export default Plants;
