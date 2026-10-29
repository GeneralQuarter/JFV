import { Button } from '@contentful/f36-components';
import { TrayArrowDownIcon } from '@contentful/f36-icons';
import type { FC } from 'react';

type ImportPointsProps = {};

const ImportPoints: FC<ImportPointsProps> = () => {
  return (
    <Button startIcon={<TrayArrowDownIcon />} size="small">
      Import Points
    </Button>
  );
};

export default ImportPoints;
