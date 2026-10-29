import type { PageAppSDK } from '@contentful/app-sdk';
import {
  Button,
  EntryCard,
  Paragraph,
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
import useSelectedTags from '../../hooks/useSelectedTags';
import useTags from '../../hooks/useTags';
import { entryTags } from '../../lib/entries';
import TagPill from '../TagPill';
import PlantQuickActions from './plant/PlantQuickActions';
import SelectionHeader from './SelectionHeader';

type SingleSelectionProps = {
  feature: SelectedFeature;
};

const SingleSelection: FC<SingleSelectionProps> = ({ feature }) => {
  const sdk = useSDK<PageAppSDK>();
  const plants = useEntries((state) => state.plants);
  const plantCards = useEntries((state) => state.plantCards);
  const tags = useTags((state) => state.tags);
  const selectedTags = useSelectedTags((state) => state.selected);
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

  const plantTags = useMemo(() => (entry ? entryTags(entry) : []), [entry]);

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
          <>
            <Paragraph>
              Right-click the plant to start moving it. Right-click the
              transparent copy to confirm; press Escape or right-click elsewhere
              to cancel.
            </Paragraph>
            <PlantQuickActions entry={entry} />
          </>
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
        {entry && (
          <>
            <SectionHeading marginBottom="none">Tags</SectionHeading>
            {plantTags.length > 0 ? (
              <Stack css={{ flexWrap: 'wrap', gap: tokens.spacingXs }}>
                {plantTags.map((tagId) => (
                  <TagPill
                    key={tagId}
                    hueIndex={
                      selectedTags.find((tag) => tag.id === tagId)?.hueIndex
                    }
                    label={tags[tagId] ?? tagId}
                  />
                ))}
              </Stack>
            ) : (
              <Paragraph marginBottom="none" css={{ color: tokens.gray600 }}>
                No tags
              </Paragraph>
            )}
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default SingleSelection;
