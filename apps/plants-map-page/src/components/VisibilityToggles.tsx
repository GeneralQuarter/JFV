import { Box, SectionHeading, Stack } from '@contentful/f36-components';
import type { FC } from 'react';
import {
  type VisibilityToggleKey,
  visibilityToggleMap,
} from '../hooks/useVisibilityToggles';
import VisibilityToggle from './VisibilityToggle';

type VisibilityTogglesProps = {};

const VisibilityToggles: FC<VisibilityTogglesProps> = () => {
  return (
    <Box>
      <SectionHeading marginBottom="spacingS">Shown on map</SectionHeading>
      <Stack flexDirection="column" alignItems="flex-start" spacing="spacingS">
        {Object.entries(visibilityToggleMap).map(([toggleKey, { label }]) => (
          <VisibilityToggle
            key={toggleKey}
            toggleKey={toggleKey as VisibilityToggleKey}
            label={label}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default VisibilityToggles;
