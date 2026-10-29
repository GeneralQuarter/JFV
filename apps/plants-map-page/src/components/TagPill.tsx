import { XIcon } from '@contentful/f36-icons';
import { t } from '@lingui/core/macro';
import type { FC } from 'react';
import { colorFromHueIndex } from '../lib/colors';
import { PillNext } from './PillNext';

type TagPillProps = {
  label: string;
  hueIndex?: number;
  onClose?: () => void;
};

const TagPill: FC<TagPillProps> = ({ label, hueIndex, onClose }) => {
  return (
    <PillNext
      actionButtonLabel={t`Remove ${label}`}
      actionIcon={onClose ? <XIcon /> : undefined}
      label={label}
      onAction={onClose}
      variant="secondary"
      size="medium"
    >
      {hueIndex !== undefined && (
        <span
          aria-hidden="true"
          css={{
            alignSelf: 'center',
            background: colorFromHueIndex(hueIndex, 1),
            borderRadius: '50%',
            flexShrink: 0,
            height: 9,
            marginRight: 8,
            order: -1,
            width: 9,
          }}
        />
      )}
    </PillNext>
  );
};

export default TagPill;
