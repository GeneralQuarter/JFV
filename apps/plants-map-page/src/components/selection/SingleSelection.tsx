import type { PageAppSDK } from '@contentful/app-sdk';
import {
  Button,
  EntryCard,
  SectionHeading,
  Stack,
} from '@contentful/f36-components';
import { PencilSimpleIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { useSDK } from '@contentful/react-apps-toolkit';
import { type FC, useMemo } from 'react';
import useEntries from '../../hooks/useEntries';
import type { SelectedFeature } from '../../hooks/useMapSelection';
import useMapSelection from '../../hooks/useMapSelection';
import PlantQuickActions from './plant/PlantQuickActions';
import SelectionHeader from './SelectionHeader';

type SingleSelectionProps = {
  feature: SelectedFeature;
};

const SingleSelection: FC<SingleSelectionProps> = ({ feature }) => {
  const sdk = useSDK<PageAppSDK>();
  const plants = useEntries((state) => state.plants);
  const plantCards = useEntries((state) => state.plantCards);
  const toggleSelect = useMapSelection((state) => state.toggleSelect);

  const entry = useMemo(() => {
    switch (feature.type) {
      case 'plant':
        return plants.find((p) => p.sys.id === feature.id);
      default:
        return;
    }
  }, [feature, plants]);

  const title = useMemo(() => {
    switch (feature.type) {
      case 'plant':
        return entry?.fields.code.fr;
      default:
        return `Unknown`;
    }
  }, [feature, entry]);

  const plantCard = useMemo(() => {
    if (!entry || entry.sys.contentType.sys.id !== 'plant') {
      return;
    }

    return plantCards.find(
      (pc) => pc.sys.id === entry.fields.commonInfo.fr.sys.id,
    );
  }, [entry, plantCards]);

  return (
    <Stack flexDirection="column">
      <SelectionHeader
        title={title}
        ariaLabel="Unselect feature"
        actions={
          <Button
            size="small"
            startIcon={<PencilSimpleIcon />}
            variant="positive"
            onClick={() =>
              sdk.navigator.openEntry(feature.id, { slideIn: true })
            }
          >
            Edit
          </Button>
        }
        onCloseClick={() => toggleSelect(feature, false)}
      />
      <Stack
        flexDirection="column"
        alignItems="flex-start"
        css={{ overflow: 'auto', paddingInline: tokens.spacingS }}
        fullWidth
      >
        {entry?.sys.contentType.sys.id === 'plant' && (
          <PlantQuickActions entry={entry} />
        )}
        {plantCard && (
          <>
            <SectionHeading marginBottom="none">Plant Cards</SectionHeading>
            <EntryCard
              contentType="Rootstock"
              title={plantCard.fields.fullLatinName.fr}
              description={`${plantCard.fields.commonName.fr} - ${plantCard.fields.height.fr}x${plantCard.fields.width.fr}m`}
              onClick={() => {
                sdk.navigator.openEntry(plantCard.sys.id, { slideIn: true });
              }}
            />
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default SingleSelection;
