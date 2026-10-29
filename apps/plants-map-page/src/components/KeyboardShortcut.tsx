import tokens from '@contentful/f36-tokens';
import type { FC, PropsWithChildren } from 'react';

const KeyboardShortcut: FC<PropsWithChildren> = ({ children }) => {
  return (
    <kbd
      css={{
        border: `1px solid ${tokens.gray600}`,
        borderBlockEndWidth: '3px',
        color: tokens.gray700,
        borderRadius: tokens.borderRadiusSmall,
        padding: '2px 4px',
      }}
    >
      {children}
    </kbd>
  );
};

export default KeyboardShortcut;
