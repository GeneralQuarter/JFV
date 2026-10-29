import { Heading, IconButton, Stack } from '@contentful/f36-components';
import { XIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import type { FC, MouseEvent as ReactMouseEvent, ReactNode } from 'react';

type SelectionHeaderProps = {
  title: string;
  ariaLabel: string;
  actions: ReactNode;
  onCloseClick?: (ev: ReactMouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

const SelectionHeader: FC<SelectionHeaderProps> = ({
  title,
  ariaLabel,
  actions,
  onCloseClick,
}) => {
  return (
    <Stack
      fullWidth
      spacing="spacingS"
      css={{
        borderBlockEnd: `1px solid ${tokens.gray200}`,
        height: '56px',
        paddingInlineEnd: tokens.spacingS,
      }}
    >
      <IconButton
        icon={<XIcon />}
        aria-label={ariaLabel}
        onClick={(ev) => onCloseClick?.(ev)}
        css={{
          height: '56px',
          width: '56px',
          borderRadius: 0,
          borderInlineEnd: `1px solid ${tokens.gray200}`,
        }}
      />
      <Heading css={{ flex: 1 }} marginBottom="none" fontSize="fontSizeM">
        {title}
      </Heading>
      {actions}
    </Stack>
  );
};

export default SelectionHeader;
