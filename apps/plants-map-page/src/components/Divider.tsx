import tokens from '@contentful/f36-tokens';
import type { FC } from 'react';

const Divider: FC = () => {
  return <hr color={tokens.gray200} css={{ marginBlock: tokens.spacingM }} />;
};

export default Divider;
