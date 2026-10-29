import type { PageAppSDK } from '@contentful/app-sdk';
import {
  Autocomplete,
  Button,
  Flex,
  FormControl,
  Modal,
  Paragraph,
  Text,
  TextInput,
} from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { normalizeSearchTerm } from '@jfv/core/domain';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { type FC, useEffect, useMemo, useState } from 'react';
import useEntries from '../hooks/useEntries';
import useMapFocus from '../hooks/useMapFocus';
import useMapSelection from '../hooks/useMapSelection';
import useMapView from '../hooks/useMapView';
import type { CmaEntry } from '../lib/entries';
import { entryCode, localized } from '../lib/entries';
import { createPlant } from '../lib/mutations/plant-create';

type CardItem = {
  id: string;
  label: string;
  detail?: string;
  entry: CmaEntry;
};

type AddPlantModalProps = {
  isShown: boolean;
  onClose: () => void;
};

const AddPlantModal: FC<AddPlantModalProps> = ({ isShown, onClose }) => {
  const sdk = useSDK<PageAppSDK>();
  const plantCards = useEntries((state) => state.plantCards);
  const addPlant = useEntries((state) => state.addPlant);
  const selectFeature = useMapSelection((state) => state.selectFeature);
  const focus = useMapFocus((state) => state.focus);
  const center = useMapView((state) => state.center);
  const [inputValue, setInputValue] = useState('');
  const [card, setCard] = useState<CardItem>();
  const [sponsor, setSponsor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isShown) {
      setCard(undefined);
      setInputValue('');
      setSponsor('');
    }
  }, [isShown]);

  const items = useMemo<CardItem[]>(() => {
    const term = normalizeSearchTerm(inputValue.trim());

    return plantCards
      .map((entry) => {
        const latinName = localized<string>(entry, 'fullLatinName') ?? '';
        const commonName = localized<string>(entry, 'commonName') ?? '';

        return {
          detail: commonName || undefined,
          entry,
          id: entry.sys.id,
          label: latinName || commonName || entryCode(entry) || t`(no name)`,
        };
      })
      .filter((item) =>
        term
          ? normalizeSearchTerm(`${item.label} ${item.detail ?? ''}`).includes(
              term,
            )
          : true,
      )
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [inputValue, plantCards]);

  const submit = async () => {
    if (!card || submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const plant = await createPlant(sdk.cma, {
        card: card.entry,
        position: center,
        sponsor: sponsor.trim(),
      });

      addPlant(plant);
      selectFeature({ id: plant.sys.id, type: 'plant' });
      focus({ ...center, zoom: 21 });
      sdk.notifier.success(t`Plant ${entryCode(plant)} added`);
      onClose();
    } catch (error) {
      console.error('Plant creation failed', error);
      sdk.notifier.error(t`Could not create the plant. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isShown={isShown} onClose={onClose} title={t`Add plant`}>
      <Modal.Content>
        <FormControl id="add-plant-card" isRequired>
          <FormControl.Label>
            <Trans>Plant card</Trans>
          </FormControl.Label>
          <Autocomplete
            id="add-plant-card"
            items={items}
            itemToString={(item) => item.label}
            listMaxHeight={320}
            listWidth="full"
            onInputValueChange={setInputValue}
            onSelectItem={setCard}
            placeholder={t`Search plant cards`}
            renderItem={(item) => (
              <Flex flexDirection="column" alignItems="flex-start">
                <Text fontWeight="fontWeightMedium">{item.label}</Text>
                {item.detail && (
                  <Text fontColor="gray600" fontSize="fontSizeS">
                    {item.detail}
                  </Text>
                )}
              </Flex>
            )}
            textOnAfterSelect="clear"
          />
        </FormControl>
        {card && (
          <Paragraph>
            <Trans>Selected card: {card.label}</Trans>
          </Paragraph>
        )}
        <FormControl id="add-plant-sponsor">
          <FormControl.Label>
            <Trans>Sponsor</Trans>
          </FormControl.Label>
          <TextInput
            id="add-plant-sponsor"
            onChange={(event) => setSponsor(event.target.value)}
            placeholder={t`Optional`}
            value={sponsor}
          />
        </FormControl>
        <Paragraph marginBottom="none">
          <Trans>The plant will be placed at the current map centre.</Trans>
        </Paragraph>
      </Modal.Content>
      <Modal.Controls>
        <Button
          isDisabled={submitting}
          onClick={() => {
            onClose();
            void sdk.navigator.openNewEntry('PlantCommonInfo', {
              slideIn: true,
            });
          }}
          size="small"
          variant="transparent"
        >
          <Trans>Create plant card</Trans>
        </Button>
        <Button isDisabled={submitting} onClick={onClose}>
          <Trans>Cancel</Trans>
        </Button>
        <Button
          isDisabled={!card || submitting}
          isLoading={submitting}
          onClick={() => void submit()}
          variant="primary"
        >
          <Trans>Add plant</Trans>
        </Button>
      </Modal.Controls>
    </Modal>
  );
};

export default AddPlantModal;
