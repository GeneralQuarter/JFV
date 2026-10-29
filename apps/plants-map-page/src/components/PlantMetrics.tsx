import { Box, SectionHeading, Stack } from '@contentful/f36-components';
import { TAG_IDS } from '@jfv/core/domain';
import { type FC, useMemo } from 'react';
import useEntries from '../hooks/useEntries';
import { entryTags } from '../lib/entries';
import Metric from './Metric';

const PlantMetrics: FC = () => {
  const plants = useEntries((state) => state.plants);
  const counts = useMemo(() => {
    const notDead = plants.filter(
      (plant) => !entryTags(plant).includes(TAG_IDS.dead),
    );

    return {
      dead: plants.length - notDead.length,
      planted: notDead.filter((plant) =>
        entryTags(plant).includes(TAG_IDS.planted),
      ).length,
      positioned: notDead.length,
    };
  }, [plants]);

  return (
    <Box>
      <SectionHeading marginBottom="spacingS">Plant metrics</SectionHeading>
      <Stack spacing="spacingXs" flexDirection="column" alignItems="flex-start">
        <Metric label="Positioned" value={counts.positioned} />
        <Metric variant="positive" label="Planted" value={counts.planted} />
        <Metric variant="negative" label="Dead" value={counts.dead} />
      </Stack>
    </Box>
  );
};

export default PlantMetrics;
