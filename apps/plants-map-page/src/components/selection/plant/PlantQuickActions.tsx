import type { PageAppSDK } from '@contentful/app-sdk';
import { Button, SectionHeading, TextInput } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { TAG_IDS } from '@jfv/core/domain';
import { type FC, useMemo, useState } from 'react';
import useEntries from '../../../hooks/useEntries';
import { type CmaEntry, entryTags } from '../../../lib/entries';
import {
  applyLocalPlantAction,
  applyPlantQuickAction,
  type QuickAction,
} from '../../../lib/mutations/plant-actions';

type PlantQuickActionsProps = {
  entry: CmaEntry;
};

const hasTag = (entry: CmaEntry, tag: string) => entryTags(entry).includes(tag);

const PlantQuickActions: FC<PlantQuickActionsProps> = ({ entry }) => {
  const sdk = useSDK<PageAppSDK>();
  const updatePlant = useEntries((state) => state.updatePlant);
  const [pending, setPending] = useState<QuickAction | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));

  const dateAt = useMemo(() => {
    const parsed = new Date(`${date}T${time}`);

    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [date, time]);

  const isPinned = hasTag(entry, TAG_IDS.pinned);
  const isPlanted = hasTag(entry, TAG_IDS.planted);
  const isDead = hasTag(entry, TAG_IDS.dead);

  if (isDead) {
    return null;
  }

  const run = async (action: QuickAction) => {
    setPending(action);

    try {
      await applyPlantQuickAction(sdk.cma, entry.sys.id, action, dateAt);
      updatePlant(entry.sys.id, (plant) =>
        applyLocalPlantAction(plant, action, dateAt),
      );
      sdk.notifier.success(
        action === 'pin'
          ? 'Plant pinned'
          : action === 'plant'
            ? 'Plant planted'
            : 'Plant marked dead',
      );
    } catch (error) {
      console.error('Plant action failed', error);
      sdk.notifier.error('Could not update the plant. Please try again.');
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <SectionHeading marginBottom="none">Quick Actions</SectionHeading>
      {!isPinned && (
        <Button
          isDisabled={pending !== null}
          isLoading={pending === 'pin'}
          isFullWidth
          onClick={() => void run('pin')}
        >
          Pin
        </Button>
      )}
      <TextInput.Group>
        <TextInput
          isDisabled={pending !== null}
          onChange={(event) => setDate(event.target.value)}
          type="date"
          value={date}
        />
        <TextInput
          isDisabled={pending !== null}
          onChange={(event) => setTime(event.target.value)}
          type="time"
          value={time}
        />
        {!isPlanted ? (
          <Button
            isDisabled={pending !== null}
            isLoading={pending === 'plant'}
            onClick={() => void run('plant')}
            variant="positive"
          >
            Plant
          </Button>
        ) : (
          <Button
            isDisabled={pending !== null}
            isLoading={pending === 'dead'}
            onClick={() => void run('dead')}
            variant="negative"
          >
            Dead
          </Button>
        )}
      </TextInput.Group>
    </>
  );
};

export default PlantQuickActions;
