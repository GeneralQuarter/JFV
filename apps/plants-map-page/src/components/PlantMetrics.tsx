import { Box, SectionHeading, Stack } from '@contentful/f36-components';
import { type FC, useMemo } from 'react';
import useEntries from '../hooks/useEntries';
import Metric from './Metric';

const PlantMetrics: FC = () => {
  const plants = useEntries((state) => state.plants);
  const positioned = useMemo(
    () => plants.filter((p) => !p.fields.declaredDeadAt),
    [plants],
  );
  const positionedCount = useMemo(() => positioned.length, [positioned]);
  const deadCount = useMemo(
    () => plants.filter((p) => !!p.fields.declaredDeadAt).length,
    [plants],
  );
  const planted = useMemo(
    () => positioned.filter((p) => !!p.fields.plantedAt).length,
    [positioned],
  );

  return (
    <Box>
      <SectionHeading marginBottom="spacingS">Plant metrics</SectionHeading>
      <Stack spacing="spacingXs" flexDirection="column" alignItems="flex-start">
        <Metric label="Positioned" value={positionedCount} />
        <Metric variant="positive" label="Planted" value={planted} />
        <Metric variant="negative" label="Dead" value={deadCount} />
      </Stack>
    </Box>
  );
};

export default PlantMetrics;
