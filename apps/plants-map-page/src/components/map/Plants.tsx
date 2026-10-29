import tokens from '@contentful/f36-tokens';
import { TAG_IDS } from '@jfv/core/domain';
import { MAP_LAYER_IDS } from '@jfv/map-data';
import circle from '@turf/circle';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { type FC, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import useEntries from '../../hooks/useEntries';
import useMapSelection from '../../hooks/useMapSelection';
import useVisibilityToggles from '../../hooks/useVisibilityToggles';
import {
  entryCode,
  entryTags,
  plantCardId,
  plantPosition,
} from '../../lib/entries';
import { mapBackgroundColor } from '../../theme';

type RenderPlant = {
  id: string;
  code: string;
  position: { lat: number; lon: number };
  diameter: number;
  height: number;
  tags: string[];
};

type PlantProperties = {
  id: string;
  type: 'plant';
  code: string;
  height: number;
  diameter: number;
};

const renderPlantToFeature =
  (showCanopy: boolean) =>
  (plant: RenderPlant): Feature<Polygon, PlantProperties> =>
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
    ) as Feature<Polygon, PlantProperties>;

const renderPlantsToFeatureCollection =
  (showCanopy: boolean) =>
  (
    renderPlants: RenderPlant[],
  ): FeatureCollection<Polygon, PlantProperties> => ({
    type: 'FeatureCollection',
    features: renderPlants.map(renderPlantToFeature(showCanopy)),
  });

const Plants: FC = () => {
  const plants = useEntries((state) => state.plants);
  const plantCards = useEntries((state) => state.plantCards);
  const showCanopy = useVisibilityToggles((state) => state.canopy);
  const showDeadPlants = useVisibilityToggles((state) => state.deadPlants);
  const showLabels = useVisibilityToggles((state) => state.plantLabels);
  const showNonPinnedPlants = useVisibilityToggles(
    (state) => state.nonPinnedPlants,
  );
  const hoveredId = useMapSelection((state) => state.hoveredId);
  const selectedFeatures = useMapSelection((state) => state.selectedFeatures);

  const plantCardsById = useMemo(
    () => new Map(plantCards.map((card) => [card.sys.id, card])),
    [plantCards],
  );

  const renderPlants = useMemo<RenderPlant[]>(
    () =>
      plants.flatMap((plant) => {
        const position = plantPosition(plant);

        if (!position) {
          return [];
        }

        const cardId = plantCardId(plant);
        const plantCard = cardId ? plantCardsById.get(cardId) : undefined;

        return [
          {
            id: plant.sys.id,
            code: entryCode(plant),
            position,
            diameter: Number(plantCard?.fields.width?.fr ?? 1),
            height: Number(plantCard?.fields.height?.fr ?? 1),
            tags: entryTags(plant).concat(
              plantCard ? entryTags(plantCard) : [],
            ),
          },
        ];
      }),
    [plantCardsById, plants],
  );

  const filteredPlants = useMemo<RenderPlant[]>(
    () =>
      renderPlants.filter(
        (plant) =>
          (showDeadPlants || !plant.tags.includes(TAG_IDS.dead)) &&
          (showNonPinnedPlants || plant.tags.includes(TAG_IDS.pinned)),
      ),
    [renderPlants, showDeadPlants, showNonPinnedPlants],
  );

  const hoveredRenderPlants = useMemo(
    () => filteredPlants.filter((plant) => plant.id === hoveredId),
    [filteredPlants, hoveredId],
  );

  const selectedRenderPlants = useMemo(
    () =>
      filteredPlants.filter((plant) =>
        selectedFeatures.some((selected) => selected.id === plant.id),
      ),
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
          id={MAP_LAYER_IDS.plant}
          paint={{
            'fill-color': 'transparent',
          }}
        />
        <Layer type="line" paint={{ 'line-color': 'gray' }} />
        <Layer
          id={MAP_LAYER_IDS.plantLabel}
          type="symbol"
          layout={{
            'text-field': ['get', 'code'],
            visibility: showLabels ? 'visible' : 'none',
          }}
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
          beforeId={MAP_LAYER_IDS.plant}
          paint={{
            'fill-color': tokens.purple300,
          }}
        />
      </Source>
      <Source type="geojson" data={selectedPlantFeatureCollection}>
        <Layer
          type="line"
          beforeId={MAP_LAYER_IDS.plantLabel}
          paint={{ 'line-color': tokens.colorPrimary, 'line-width': 2 }}
        />
      </Source>
    </>
  );
};

export default Plants;
