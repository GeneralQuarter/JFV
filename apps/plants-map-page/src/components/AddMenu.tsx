import { Button } from '@contentful/f36-components';
import { PlusIcon } from '@contentful/f36-icons';
import { type FC, useState } from 'react';
import AddPlantModal from './AddPlantModal';

const AddMenu: FC = () => {
  const [isPlantModalShown, setPlantModalShown] = useState(false);

  return (
    <>
      <Button
        onClick={() => setPlantModalShown(true)}
        size="small"
        startIcon={<PlusIcon />}
        variant="primary"
      >
        Add plant
      </Button>
      <AddPlantModal
        isShown={isPlantModalShown}
        onClose={() => setPlantModalShown(false)}
      />
    </>
  );
};

export default AddMenu;
