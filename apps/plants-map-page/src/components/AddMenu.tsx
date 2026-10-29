import type { PageAppSDK } from '@contentful/app-sdk';
import { Button, Menu } from '@contentful/f36-components';
import { PlusIcon } from '@contentful/f36-icons';
import { useSDK } from '@contentful/react-apps-toolkit';
import { type FC, useState } from 'react';
import useSectorDrawing from '../hooks/useSectorDrawing';
import AddPlantModal from './AddPlantModal';

const AddMenu: FC = () => {
  const sdk = useSDK<PageAppSDK>();
  const startDrawing = useSectorDrawing((state) => state.start);
  const [isPlantModalShown, setPlantModalShown] = useState(false);

  return (
    <>
      <Menu>
        <Menu.Trigger>
          <Button size="small" startIcon={<PlusIcon />} variant="primary">
            Add
          </Button>
        </Menu.Trigger>
        <Menu.List>
          <Menu.Item onClick={() => setPlantModalShown(true)}>Plant</Menu.Item>
          <Menu.Item
            onClick={() => {
              void sdk.navigator.openNewEntry('PlantCommonInfo', {
                slideIn: true,
              });
            }}
          >
            Plant card
          </Menu.Item>
          <Menu.Item onClick={startDrawing}>Draw sector</Menu.Item>
        </Menu.List>
      </Menu>
      <AddPlantModal
        isShown={isPlantModalShown}
        onClose={() => setPlantModalShown(false)}
      />
    </>
  );
};

export default AddMenu;
