import {
  Button,
  NavList,
  SectionHeading,
  Stack,
} from '@contentful/f36-components';
import { TrayArrowUpIcon } from '@contentful/f36-icons';
import tokens from '@contentful/f36-tokens';
import type { EntryProps, KeyValueMap } from 'contentful-management';
import { type FC, useMemo } from 'react';
import useEntries from '../../hooks/useEntries';
import type { SelectedFeature } from '../../hooks/useMapSelection';
import useMapSelection from '../../hooks/useMapSelection';
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
  const plantFeatures = useMemo(
    () => features.filter((f) => f.type === 'plant'),
    [features],
  );
  const plantEntries = useMemo(
    () =>
      plants
        .filter((p) => plantFeatures.some((pf) => pf.id === p.sys.id))
        .sort(sortBySelectionOrder(plantFeatures)),
    [plants, plantFeatures],
  );

  return (
    <Stack flexDirection="column" spacing="none" fullHeight>
      <SelectionHeader
        title="Multi selection"
        ariaLabel="clear all selected features"
        actions={
          <Button size="small" startIcon={<TrayArrowUpIcon />}>
            Export
          </Button>
        }
        onCloseClick={() => clearSelected()}
      />
      <Stack
        flexDirection="column"
        alignItems="flex-start"
        css={{
          '& nav': { width: '100%', overflow: 'auto' },
          padding: tokens.spacingS,
          '& li': { cursor: 'pointer' },
        }}
        fullWidth
      >
        <SectionHeading marginBottom="none">Plants</SectionHeading>
        <NavList aria-label="Selected plants">
          {plantEntries.map((pe) => (
            <NavList.Item key={pe.sys.id} as="button">
              {pe.fields.code.fr}
            </NavList.Item>
          ))}
        </NavList>
      </Stack>
    </Stack>
  );
};

export default MultiSelection;
