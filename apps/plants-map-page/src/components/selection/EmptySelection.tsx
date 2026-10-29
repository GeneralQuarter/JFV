import { Heading, List, Stack } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import { Trans } from '@lingui/react/macro';
import type { FC } from 'react';
import KeyboardShortcut from '../KeyboardShortcut';

const EmptySelection: FC = () => {
  return (
    <Stack
      alignItems="center"
      flexDirection="column"
      fullHeight
      fullWidth
      css={{
        paddingBlockStart: tokens.spacingXl,
        paddingInline: tokens.spacingS,
      }}
    >
      <Heading fontColor="gray600">
        <Trans>Nothing Selected</Trans>
      </Heading>
      <List css={{ color: tokens.gray600 }}>
        <List.Item>
          <Trans>
            <KeyboardShortcut>Click</KeyboardShortcut> on a feature to select it
          </Trans>
        </List.Item>
        <List.Item>
          <Trans>
            You can select multiple features by holding{' '}
            <KeyboardShortcut>Ctrl</KeyboardShortcut>
          </Trans>
        </List.Item>
      </List>
    </Stack>
  );
};

export default EmptySelection;
