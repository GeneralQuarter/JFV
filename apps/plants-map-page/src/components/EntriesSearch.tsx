import { TextInput } from '@contentful/f36-components';
import type { FC } from 'react';

type EntriesSearchProps = {};

const EntriesSearch: FC<EntriesSearchProps> = () => {
  return <TextInput size="small" placeholder="Search" />;
};

export default EntriesSearch;
