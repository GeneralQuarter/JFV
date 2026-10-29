import type { PageAppSDK } from '@contentful/app-sdk';
import { Button } from '@contentful/f36-components';
import { TrashSimpleIcon, TrayArrowDownIcon } from '@contentful/f36-icons';
import { useSDK } from '@contentful/react-apps-toolkit';
import { type ChangeEvent, type FC, useRef, useState } from 'react';
import useEntries from '../hooks/useEntries';
import useMeasuredPoints from '../hooks/useMeasuredPoints';
import { addEntryTag, entryTags } from '../lib/entries';
import { MARKED_TAG_ID } from '../lib/keys';
import { parseMeasuredPointsCsv, parsePlantIdsJson } from '../lib/points';

const ImportPoints: FC = () => {
  const sdk = useSDK<PageAppSDK>();
  const plants = useEntries((state) => state.plants);
  const updatePlant = useEntries((state) => state.updatePlant);
  const points = useMeasuredPoints((state) => state.points);
  const setPoints = useMeasuredPoints((state) => state.setPoints);
  const clearPoints = useMeasuredPoints((state) => state.clearPoints);
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const markPlants = (ids: string[]) => {
    const idSet = new Set(ids.map((id) => id.trim()));
    let marked = 0;

    for (const plant of plants) {
      if (
        !idSet.has(plant.sys.id) ||
        entryTags(plant).includes(MARKED_TAG_ID)
      ) {
        continue;
      }

      updatePlant(plant.sys.id, (entry) => addEntryTag(entry, MARKED_TAG_ID));
      marked += 1;
    }

    if (marked > 0) {
      sdk.notifier.success(
        `${marked} plant${marked === 1 ? '' : 's'} marked. Select the Marked tag to highlight them.`,
      );
    } else {
      sdk.notifier.error('No loaded plants matched that list.');
    }
  };

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setImporting(true);

    try {
      const text = await file.text();

      if (file.name.toLowerCase().endsWith('.json')) {
        markPlants(parsePlantIdsJson(text));
        return;
      }

      const points = parseMeasuredPointsCsv(text);

      if (points.length === 0) {
        sdk.notifier.error(
          'No points found. Use name, latitude and longitude columns.',
        );
        return;
      }

      setPoints(points);
      sdk.notifier.success(
        `${points.length} measured point${points.length === 1 ? '' : 's'} loaded. Ctrl/Cmd+click one to move the selected plant; Shift+Ctrl/Cmd copies coordinates.`,
      );
    } catch (error) {
      console.error('Points import failed', error);
      sdk.notifier.error('Could not read that file.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Button
        isDisabled={importing}
        isLoading={importing}
        onClick={() => fileInput.current?.click()}
        size="small"
        startIcon={<TrayArrowDownIcon />}
        title="Import measured points (CSV) or marked plants (JSON)"
      >
        Import
      </Button>
      <Button
        isDisabled={importing || points.length === 0}
        onClick={() => {
          clearPoints();
          sdk.notifier.success('Measured points cleared.');
        }}
        size="small"
        startIcon={<TrashSimpleIcon />}
        title="Clear measured points"
      >
        Clear
      </Button>
      <input
        accept=".csv,.json,text/csv,application/json"
        onChange={(event) => void importFile(event)}
        ref={fileInput}
        style={{ display: 'none' }}
        type="file"
      />
    </>
  );
};

export default ImportPoints;
