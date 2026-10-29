import type { PageAppSDK } from '@contentful/app-sdk';
import {
  Button,
  EntryCard,
  List,
  Paragraph,
  SectionHeading,
  Stack,
} from '@contentful/f36-components';
import { PencilSimpleIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { useSDK } from '@contentful/react-apps-toolkit';
import { TAG_IDS } from '@jfv/core/domain';
import { type FC, useMemo } from 'react';
import useEntries from '../../hooks/useEntries';
import type { SelectedFeature } from '../../hooks/useMapSelection';
import useMapSelection from '../../hooks/useMapSelection';
import useSelectedTags from '../../hooks/useSelectedTags';
import useTags from '../../hooks/useTags';
import { entryCode, entryName, entryTags, localized } from '../../lib/entries';
import KeyboardShortcut from '../KeyboardShortcut';
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
  const rectangles = useEntries((state) => state.rectangles);
  const mapZones = useEntries((state) => state.mapZones);
  const tags = useTags((state) => state.tags);
  const selectedTags = useSelectedTags((state) => state.selected);
  const toggleSelect = useMapSelection((state) => state.toggleSelect);

  const entry = useMemo(() => {
    switch (feature.type) {
      case 'plant':
        return plants.find((p) => p.sys.id === feature.id);
      case 'rectangle':
        return rectangles.find((rectangle) => rectangle.sys.id === feature.id);
      case 'mapZone':
        return mapZones.find((zone) => zone.sys.id === feature.id);
      default:
        return;
    }
  }, [feature, mapZones, plants, rectangles]);

  const title = useMemo(() => {
    switch (feature.type) {
      case 'plant':
        return entry ? entryCode(entry) || 'Plant' : 'Plant';
      case 'rectangle':
        return entry
          ? entryCode(entry) || localized<string>(entry, 'label') || 'Rectangle'
          : 'Rectangle';
      case 'mapZone':
        return entry ? entryName(entry) || 'Zone' : 'Zone';
      default:
        return 'Unknown';
    }
  }, [entry, feature.type]);

  const rectangleLabel = useMemo(() => {
    if (!entry || entry.sys.contentType.sys.id !== 'rectangle') {
      return;
    }

    return localized<string>(entry, 'label');
  }, [entry]);

  const plantCard = useMemo(() => {
    if (!entry || entry.sys.contentType.sys.id !== 'plant') {
      return;
    }

    return plantCards.find(
      (pc) => pc.sys.id === entry.fields.commonInfo.fr.sys.id,
    );
  }, [entry, plantCards]);

  const plantTags = useMemo(() => (entry ? entryTags(entry) : []), [entry]);
  const isPlanted = plantTags.includes(TAG_IDS.planted);

  return (
    <Stack flexDirection="column" fullHeight>
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
        css={{
          flex: 1,
          minHeight: 0,
          overflowX: 'hidden',
          overflowY: 'auto',
          paddingInline: tokens.spacingS,
        }}
        fullWidth
      >
        {entry?.sys.contentType.sys.id === 'plant' && (
          <PlantQuickActions entry={entry} />
        )}
        {entry?.sys.contentType.sys.id === 'rectangle' && rectangleLabel && (
          <Paragraph>{rectangleLabel}</Paragraph>
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
              <Stack css={{ flexWrap: 'wrap', gap: tokens.spacingS }}>
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
        {entry && (
          <List
            css={{
              color: tokens.gray600,
              marginBlockStart: tokens.spacingM,
            }}
          >
            {feature.type === 'plant' &&
              (isPlanted ? (
                <List.Item>Planted plants cannot be moved.</List.Item>
              ) : (
                <>
                  <List.Item>
                    <KeyboardShortcut>Right-click</KeyboardShortcut> the plant
                    to move it
                  </List.Item>
                  <List.Item>
                    <KeyboardShortcut>Right-click</KeyboardShortcut> the
                    transparent copy to confirm, or{' '}
                    <KeyboardShortcut>Escape</KeyboardShortcut> to cancel
                  </List.Item>
                </>
              ))}
            {feature.type === 'rectangle' && (
              <>
                <List.Item>
                  <KeyboardShortcut>Right-click</KeyboardShortcut> the rectangle
                  to move it
                </List.Item>
                <List.Item>
                  <KeyboardShortcut>Scroll</KeyboardShortcut> over the moving
                  rectangle to rotate it
                </List.Item>
                <List.Item>
                  <KeyboardShortcut>Right-click</KeyboardShortcut> the copy to
                  confirm, or <KeyboardShortcut>Escape</KeyboardShortcut> to
                  cancel
                </List.Item>
              </>
            )}
            {feature.type === 'mapZone' && (
              <>
                <List.Item>
                  <KeyboardShortcut>Right-click</KeyboardShortcut> the zone to
                  move it
                </List.Item>
                <List.Item>
                  <KeyboardShortcut>Right-click</KeyboardShortcut> the copy to
                  confirm, or <KeyboardShortcut>Escape</KeyboardShortcut> to
                  cancel
                </List.Item>
              </>
            )}
          </List>
        )}
      </Stack>
    </Stack>
  );
};

export default SingleSelection;
