import { Button, SectionHeading, TextInput } from '@contentful/f36-components';
import type { EntryProps, KeyValueMap } from 'contentful-management';
import { type FC, useMemo } from 'react';

type PlantQuickActionsProps = {
  entry: EntryProps<KeyValueMap>;
};

const hasTag = (entry: EntryProps<KeyValueMap>, tag: string) =>
  entry.metadata?.tags.find((t) => t.sys.id === tag);

const PlantQuickActions: FC<PlantQuickActionsProps> = ({ entry }) => {
  const isPinned = useMemo(() => hasTag(entry, 'jalonne'), [entry]);
  const isPlanted = useMemo(() => hasTag(entry, 'planted'), [entry]);
  const isDead = useMemo(() => hasTag(entry, 'dead'), [entry]);

  if (isDead) {
    return;
  }

  return (
    <>
      <SectionHeading marginBottom="none">Quick Actions</SectionHeading>
      {!isPinned && <Button isFullWidth>Pin</Button>}
      {!isPlanted ? (
        <TextInput.Group>
          <TextInput type="date" />
          <TextInput type="time" />
          <Button variant="positive">Plant</Button>
        </TextInput.Group>
      ) : (
        <TextInput.Group>
          <TextInput type="date" />
          <TextInput type="time" />
          <Button variant="negative">Dead</Button>
        </TextInput.Group>
      )}
    </>
  );
};

export default PlantQuickActions;
