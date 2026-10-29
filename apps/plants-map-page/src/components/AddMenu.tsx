import type { PageAppSDK } from '@contentful/app-sdk';
import { Button, Menu } from '@contentful/f36-components';
import { PlusIcon } from '@contentful/f36-icons';
import { useSDK } from '@contentful/react-apps-toolkit';
import { Trans } from '@lingui/react/macro';
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
            <Trans>Add</Trans>
          </Button>
        </Menu.Trigger>
        <Menu.List>
          <Menu.Item onClick={() => setPlantModalShown(true)}>
            <Trans>Plant</Trans>
          </Menu.Item>
          <Menu.Item
            onClick={() => {
              void sdk.navigator.openNewEntry('PlantCommonInfo', {
                slideIn: true,
              });
            }}
          >
            <Trans>Plant card</Trans>
          </Menu.Item>
          <Menu.Item onClick={startDrawing}>
            <Trans>Draw sector</Trans>
          </Menu.Item>
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
