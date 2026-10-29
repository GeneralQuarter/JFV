import { Chip, Stack, Typography } from '@mui/material';
import { type FC, useMemo } from 'react';
import useDateTimeFormat from '../hooks/useDateTimeFormat';
import useFullLatinName from '../hooks/useFullLatinName';
import useNumberFormat from '../hooks/useNumberFormat';
import type { Plant } from '../lib/db/entities/plant';
import type { Tags } from '../types/tags';

type PlantDetailsProps = {
  plant: Plant;
  tags: Tags;
};

const PlantDetails: FC<PlantDetailsProps> = ({ plant, tags }) => {
  const plantedAt = useDateTimeFormat(plant.plantedAt, 'fr', {
    dateStyle: 'long',
    timeStyle: 'short',
  });
  const diameter = useNumberFormat(plant.plantCard?.diameter, 'fr', {
    style: 'unit',
    unit: 'meter',
  });
  const height = useNumberFormat(plant.plantCard?.height, 'fr', {
    style: 'unit',
    unit: 'meter',
  });
  const fullLatinName = useFullLatinName(plant.plantCard);
  const plantTagIds = useMemo<string[]>(() => {
    return plant.tags.concat(plant.plantCard?.tags ?? []);
  }, [plant.tags, plant.plantCard?.tags]);

  return (
    <Stack>
      {plantedAt && (
        <Typography variant="body2">
          Planté le{' '}
          <Typography variant="subtitle2" component="span">
            {plantedAt}
          </Typography>
        </Typography>
      )}
      <Typography variant="h5">{fullLatinName}</Typography>
      <Typography variant="subtitle1">{plant.plantCard?.commonName}</Typography>
      <Typography mt={1}>
        {diameter} x {height}
      </Typography>
      {plant.godparent && (
        <Typography variant="body2">
          Parrainé par{' '}
          <Typography color="secondary" component="span">
            {plant.godparent}
          </Typography>
        </Typography>
      )}
      <Stack flexDirection="row" gap={1} mt={2} flexWrap="wrap">
        {plantTagIds.map((t) => (
          <Chip key={t} label={tags[t]} />
        ))}
      </Stack>
    </Stack>
  );
};

export default PlantDetails;
