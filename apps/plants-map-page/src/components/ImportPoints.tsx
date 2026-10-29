import type { PageAppSDK } from '@contentful/app-sdk';
import { Button, Menu } from '@contentful/f36-components';
import { TrayArrowDownIcon } from '@contentful/f36-icons';
import { useSDK } from '@contentful/react-apps-toolkit';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { type ChangeEvent, type FC, useRef, useState } from 'react';
import useEntries from '../hooks/useEntries';
import useMeasuredPoints from '../hooks/useMeasuredPoints';
import useMeasurementGraph from '../hooks/useMeasurementGraph';
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
  const measurementCount = useMeasurementGraph(
    (state) => state.graph.edges.length,
  );
  const clearMeasurements = useMeasurementGraph(
    (state) => state.clearMeasurements,
  );
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
        marked === 1
          ? t`1 plant marked. Select the Marked tag to highlight it.`
          : t`${marked} plants marked. Select the Marked tag to highlight them.`,
      );
    } else {
      sdk.notifier.error(t`No loaded plants matched that list.`);
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
          t`No points found. Use name, latitude and longitude columns.`,
        );
        return;
      }

      setPoints(points);
      clearMeasurements();
      sdk.notifier.success(
        t`${points.length} measured points loaded. Ctrl/Cmd+click one to move the selected plant; Shift+Ctrl/Cmd copies coordinates.`,
      );
    } catch (error) {
      console.error('Points import failed', error);
      sdk.notifier.error(t`Could not read that file.`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Menu>
        <Menu.Trigger>
          <Button
            isDisabled={importing}
            isLoading={importing}
            size="small"
            startIcon={<TrayArrowDownIcon />}
          >
            <Trans>Points</Trans>
          </Button>
        </Menu.Trigger>
        <Menu.List>
          <Menu.Item
            isDisabled={importing}
            onClick={() => fileInput.current?.click()}
          >
            <Trans>Import points (CSV/JSON)</Trans>
          </Menu.Item>
          <Menu.Item
            isDisabled={importing || points.length === 0}
            onClick={() => {
              clearPoints();
              clearMeasurements();
              sdk.notifier.success(
                t`Measured points and measurements cleared.`,
              );
            }}
          >
            <Trans>Clear points</Trans>
          </Menu.Item>
          <Menu.Item
            isDisabled={importing || measurementCount === 0}
            onClick={() => {
              clearMeasurements();
              sdk.notifier.success(t`Measurements cleared.`);
            }}
          >
            <Trans>Clear measurements</Trans>
          </Menu.Item>
        </Menu.List>
      </Menu>
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
