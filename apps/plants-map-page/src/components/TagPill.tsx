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
    <span
      css={{
        alignItems: 'center',
        background: tokens.gray100,
        border: `1px solid ${tokens.gray300}`,
        borderRadius: 999,
        display: 'inline-flex',
        fontSize: tokens.fontSizeS,
        gap: 6,
        lineHeight: 1.5,
        padding: '2px 4px 2px 8px',
      }}
    >
      {hueIndex !== undefined && (
        <span
          aria-hidden="true"
          css={{
            background: colorFromHueIndex(hueIndex, 1),
            borderRadius: '50%',
            height: 8,
            width: 8,
          }}
        />
      )}
      <span>{label}</span>
      {onClose && (
        <button
          aria-label={`Remove ${label}`}
          css={{
            alignItems: 'center',
            background: 'transparent',
            border: 'none',
            borderRadius: '50%',
            color: tokens.gray600,
            cursor: 'pointer',
            display: 'inline-flex',
            fontSize: tokens.fontSizeS,
            height: 16,
            justifyContent: 'center',
            lineHeight: 1,
            padding: 0,
            width: 16,
            '&:hover': {
              background: tokens.gray200,
              color: tokens.gray800,
            },
          }}
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default TagPill;
