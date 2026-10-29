import { Button } from '@contentful/f36-components';
import { PlusIcon } from '@contentful/f36-icons';
import type { FC } from 'react';

const AddMenu: FC = () => {
  return (
    <Button
      isDisabled
      size="small"
      startIcon={<PlusIcon />}
      title="Add plant / plant card — coming soon"
      variant="primary"
    >
      Add
    </Button>
  );
};

export default AddMenu;
