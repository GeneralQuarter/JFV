import circle from '@turf/circle';
import type { FeatureCollection } from 'geojson';
import { type FC, useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';
import type { Filter, FilterType } from '../../hooks/useFilters';
import type { Plant } from '../../lib/db/entities/plant';
import theme from '../../theme';

type PlantsProps = {
  selectedPlantId: string | undefined;
  showCanopy: boolean;
  plants: Plant[] | undefined;
  filters: Filter[];
};

const hasTag = (type: FilterType, ids: string[]) => (filters: Filter[]) =>
  filters.some((f) => f.type === type && ids.includes(f.id));

const plantTagged = (plant: Plant, filters: Filter[]): boolean => {
  return (
    (plant.godparent && hasTag('tag', ['sponsored'])(filters)) ||
    (plant.godparent && hasTag('sponsor', [plant.godparent])(filters)) ||
    hasTag('tag', plant.tags.concat(plant.plantCard?.tags ?? []))(filters)
  );
};

const plantsToFeatureCollection = (
  plants: Plant[],
  selectedPlantId: string | undefined,
  showCanopy: boolean,
  filters: Filter[],
): FeatureCollection => {
  return {
    type: 'FeatureCollection',
    features: plants.map((plant) => {
      const plantCard = plant.plantCard;
      const diameter = plantCard?.diameter ?? 1;
      return circle(
        plant.position ? [plant.position[1], plant.position[0]] : [0, 0],
        (showCanopy || diameter < 2 ? diameter : 2) / 2000,
        {
          properties: {
            id: plant.id,
            code: plant.code,
            height: plantCard?.height ?? 1,
            tagged: plantTagged(plant, filters),
            selected: selectedPlantId === plant.id,
          },
        },
      );
    }),
  };
};

const Plants: FC<PlantsProps> = ({
  plants,
  selectedPlantId,
  showCanopy,
  filters,
}) => {
  const plantFeatureCollection = useMemo(
    () =>
      plantsToFeatureCollection(
        plants ?? [],
        selectedPlantId,
        showCanopy,
        filters,
      ),
    [plants, selectedPlantId, showCanopy, filters],
  );

  return (
    <Source type="geojson" data={plantFeatureCollection}>
      <Layer
        type="fill"
        id="plant"
        paint={{
          'fill-color': [
            'case',
            ['boolean', ['get', 'selected'], false],
            'blue',
            ['boolean', ['get', 'tagged'], false],
            theme.palette.secondary.main,
            'transparent',
          ],
          'fill-opacity': 0.5,
        }}
      />
      <Layer type="line" paint={{ 'line-color': 'gray' }}></Layer>
      <Layer
        type="symbol"
        layout={{ 'text-field': ['get', 'code'] }}
        paint={{
          'text-color': theme.palette.text.primary,
          'text-halo-color': theme.palette.background.paper,
          'text-halo-width': 2,
          'text-opacity': ['step', ['zoom'], 0, 19, 1],
        }}
      />
    </Source>
  );
};

export default Plants;
