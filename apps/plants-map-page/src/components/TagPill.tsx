import { Pill } from '@contentful/f36-components';
import tokens from '@contentful/f36-tokens';
import type { FC } from 'react';
import { colorFromHueIndex } from '../lib/colors';

type TagPillProps = {
  label: string;
  hueIndex?: number;
  onClose?: () => void;
};

const TagPill: FC<TagPillProps> = ({ label, hueIndex, onClose }) => {
  return (
    <Pill
      closeButtonAriaLabel={`Remove ${label}`}
      label={label}
      onClose={onClose}
      variant={hueIndex === undefined ? 'idle' : 'active'}
      css={
        hueIndex === undefined
          ? undefined
          : {
              '&::before': {
                alignSelf: 'stretch',
                background: colorFromHueIndex(hueIndex, 1),
                borderRadius: tokens.borderRadiusSmall,
                content: '""',
                flexShrink: 0,
                width: 8,
              },
            }
      }
    />
  );
};

export default TagPill;
