import { Box, SectionHeading, Stack } from '@contentful/f36-components';
import { useLingui } from '@lingui/react';
import { Trans } from '@lingui/react/macro';
import type { FC } from 'react';
import {
  type VisibilityToggleKey,
  visibilityToggleMap,
} from '../hooks/useVisibilityToggles';
import VisibilityToggle from './VisibilityToggle';

const VisibilityToggles: FC = () => {
  const { i18n } = useLingui();

  return (
    <Box>
      <SectionHeading marginBottom="spacingS">
        <Trans>Shown on map</Trans>
      </SectionHeading>
      <Stack flexDirection="column" alignItems="flex-start" spacing="spacingS">
        {Object.entries(visibilityToggleMap).map(([toggleKey, { label }]) => (
          <VisibilityToggle
            key={toggleKey}
            toggleKey={toggleKey as VisibilityToggleKey}
            label={i18n._(label)}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default VisibilityToggles;
