import { Button, Menu } from '@contentful/f36-components';
import { CaretDownIcon, PlusIcon } from '@contentful/f36-icons';
import type { FC } from 'react';

const AddMenu: FC = () => {
  return (
    <Menu>
      <Menu.Trigger>
        <Button
          startIcon={<PlusIcon />}
          endIcon={<CaretDownIcon />}
          size="small"
          variant="primary"
        >
          Add
        </Button>
      </Menu.Trigger>
      <Menu.List>
        <Menu.Item>Plant</Menu.Item>
        <Menu.Item>Plant Card</Menu.Item>
      </Menu.List>
    </Menu>
  );
};

export default AddMenu;
