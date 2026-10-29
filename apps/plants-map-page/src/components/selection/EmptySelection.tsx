import { Heading, List, Stack } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
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
      <Heading fontColor="gray600">Nothing Selected</Heading>
      <List css={{ color: tokens.gray600 }}>
        <List.Item>
          <KeyboardShortcut>Click</KeyboardShortcut> on a feature to select it
        </List.Item>
        <List.Item>
          You can select multiple features by holding{' '}
          <KeyboardShortcut>Ctrl</KeyboardShortcut>
        </List.Item>
      </List>
    </Stack>
  );
};

export default EmptySelection;
