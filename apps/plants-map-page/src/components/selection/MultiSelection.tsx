import {
  Button,
  NavList,
  SectionHeading,
  Stack,
} from '@contentful/f36-components';
import { TrayArrowUpIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import type { EntryProps, KeyValueMap } from 'contentful-management';
import { type FC, useMemo } from 'react';
import useEntries from '../../hooks/useEntries';
import type { SelectedFeature } from '../../hooks/useMapSelection';
import useMapSelection from '../../hooks/useMapSelection';
import { entryCode, entryName, plantPosition } from '../../lib/entries';
import { downloadText, plantsToCsv } from '../../lib/points';
import SelectionHeader from './SelectionHeader';

type MultiSelectionProps = {
  features: SelectedFeature[];
};

function sortBySelectionOrder(features: SelectedFeature[]) {
  return (a: EntryProps<KeyValueMap>, b: EntryProps<KeyValueMap>) =>
    features.findIndex((f) => f.id === a.sys.id) -
    features.findIndex((f) => f.id === b.sys.id);
}

const MultiSelection: FC<MultiSelectionProps> = ({ features }) => {
  const clearSelected = useMapSelection((state) => state.clearSelected);
  const plants = useEntries((state) => state.plants);
  const rectangles = useEntries((state) => state.rectangles);
  const mapZones = useEntries((state) => state.mapZones);
  const plantFeatures = useMemo(
    () => features.filter((f) => f.type === 'plant'),
    [features],
  );
  const rectangleFeatures = useMemo(
    () => features.filter((f) => f.type === 'rectangle'),
    [features],
  );
  const zoneFeatures = useMemo(
    () => features.filter((f) => f.type === 'mapZone'),
    [features],
  );
  const plantEntries = useMemo(
    () =>
      plants
        .filter((p) => plantFeatures.some((pf) => pf.id === p.sys.id))
        .sort(sortBySelectionOrder(plantFeatures)),
    [plants, plantFeatures],
  );
  const rectangleEntries = useMemo(
    () =>
      rectangles
        .filter((rectangle) =>
          rectangleFeatures.some((f) => f.id === rectangle.sys.id),
        )
        .sort(sortBySelectionOrder(rectangleFeatures)),
    [rectangleFeatures, rectangles],
  );
  const zoneEntries = useMemo(
    () =>
      mapZones
        .filter((zone) => zoneFeatures.some((f) => f.id === zone.sys.id))
        .sort(sortBySelectionOrder(zoneFeatures)),
    [mapZones, zoneFeatures],
  );
  const exportablePlants = useMemo(
    () => plantEntries.filter((plant) => plantPosition(plant) !== undefined),
    [plantEntries],
  );

  const exportPlants = () => {
    if (exportablePlants.length === 0) {
      return;
    }

    const date = new Date().toISOString().slice(0, 10);

    downloadText(
      `jfv-selected-plants-${date}.csv`,
      plantsToCsv(exportablePlants),
      'text/csv;charset=utf-8;',
    );
  };

  return (
    <Stack flexDirection="column" spacing="none" fullHeight>
      <SelectionHeader
        title={t`Multi selection`}
        ariaLabel={t`Clear all selected features`}
        actions={
          <Button
            isDisabled={exportablePlants.length === 0}
            onClick={exportPlants}
            size="small"
            startIcon={<TrayArrowUpIcon />}
            title={t`Export selected plants as CSV`}
          >
            <Trans>Export</Trans>
          </Button>
        }
        onCloseClick={() => clearSelected()}
      />
      <Stack
        flexDirection="column"
        alignItems="flex-start"
        css={{
          '& nav': { width: '100%', overflow: 'auto' },
          flex: 1,
          minHeight: 0,
          overflowX: 'hidden',
          overflowY: 'auto',
          padding: tokens.spacingS,
          '& li': { cursor: 'pointer' },
        }}
        fullWidth
      >
        {plantEntries.length > 0 && (
          <>
            <SectionHeading marginBottom="none">
              <Trans>Plants</Trans>
            </SectionHeading>
            <NavList aria-label={t`Selected plants`}>
              {plantEntries.map((pe) => (
                <NavList.Item key={pe.sys.id} as="button">
                  {entryCode(pe)}
                </NavList.Item>
              ))}
            </NavList>
          </>
        )}
        {rectangleEntries.length > 0 && (
          <>
            <SectionHeading marginBottom="none">
              <Trans>Rectangles</Trans>
            </SectionHeading>
            <NavList aria-label={t`Selected rectangles`}>
              {rectangleEntries.map((rectangle) => (
                <NavList.Item key={rectangle.sys.id} as="button">
                  {entryCode(rectangle) || t`Rectangle`}
                </NavList.Item>
              ))}
            </NavList>
          </>
        )}
        {zoneEntries.length > 0 && (
          <>
            <SectionHeading marginBottom="none">
              <Trans>Zones</Trans>
            </SectionHeading>
            <NavList aria-label={t`Selected zones`}>
              {zoneEntries.map((zone) => (
                <NavList.Item key={zone.sys.id} as="button">
                  {entryName(zone) || t`Zone`}
                </NavList.Item>
              ))}
            </NavList>
          </>
        )}
      </Stack>
    </Stack>
  );
};

export default MultiSelection;
