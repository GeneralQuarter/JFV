import type { PageAppSDK } from '@contentful/app-sdk';
import { Button } from '@contentful/f36-components';
import { TrayArrowDownIcon, TrayArrowUpIcon } from '@contentful/f36-icons';
import { useSDK } from '@contentful/react-apps-toolkit';
import { type ChangeEvent, type FC, useRef, useState } from 'react';
import useEntries from '../hooks/useEntries';
import { entryCode, plantPosition } from '../lib/entries';
import {
  findPlantByCode,
  setLocalPlantPosition,
  updatePlantPosition,
} from '../lib/mutations/plant-actions';
import { downloadText, parsePointsFile, plantsToCsv } from '../lib/points';

const ImportPoints: FC = () => {
  const sdk = useSDK<PageAppSDK>();
  const plants = useEntries((state) => state.plants);
  const addPlant = useEntries((state) => state.addPlant);
  const updatePlant = useEntries((state) => state.updatePlant);
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const importFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    setImporting(true);

    try {
      const points = parsePointsFile(await file.text(), file.name);

      if (points.length === 0) {
        sdk.notifier.error(
          'No points found. Use code/name, latitude and longitude columns.',
        );
        return;
      }

      const plantsByCode = new Map(
        plants.map((plant) => [entryCode(plant).trim().toLowerCase(), plant]),
      );
      const missing: string[] = [];
      let updated = 0;
      let failed = 0;

      for (const point of points) {
        const position = { lat: point.lat, lon: point.lon };
        const knownPlant = plantsByCode.get(point.code.toLowerCase());

        try {
          const plant =
            knownPlant ?? (await findPlantByCode(sdk.cma, point.code.trim()));

          if (!plant) {
            missing.push(point.code);
            continue;
          }

          const published = await updatePlantPosition(
            sdk.cma,
            plant.sys.id,
            position,
          );

          if (knownPlant) {
            updatePlant(plant.sys.id, (entry) =>
              setLocalPlantPosition(entry, position),
            );
          } else {
            addPlant(published);
          }

          updated += 1;
        } catch (error) {
          console.error('Point import failed', point.code, error);
          failed += 1;
        }
      }

      if (updated > 0) {
        sdk.notifier.success(
          `${updated} plant position${updated === 1 ? '' : 's'} updated.`,
        );
      }

      if (missing.length > 0 || failed > 0) {
        if (missing.length > 0) {
          console.warn('Unknown plant codes', missing);
        }

        sdk.notifier.error(
          [
            missing.length > 0
              ? `${missing.length} unknown code${missing.length === 1 ? '' : 's'}`
              : null,
            failed > 0
              ? `${failed} update${failed === 1 ? '' : 's'} failed`
              : null,
          ]
            .filter(Boolean)
            .join(' · ') || 'Some points could not be applied.',
        );
      }
    } catch (error) {
      console.error('Points import failed', error);
      sdk.notifier.error('Could not read that file.');
    } finally {
      setImporting(false);
    }
  };

  const exportPlants = () => {
    const positionedPlants = plants.filter(
      (plant) => plantPosition(plant) !== undefined,
    );

    if (positionedPlants.length === 0) {
      sdk.notifier.error('There are no positioned plants to export.');
      return;
    }

    const date = new Date().toISOString().slice(0, 10);

    downloadText(
      `jfv-plants-${date}.csv`,
      plantsToCsv(positionedPlants),
      'text/csv;charset=utf-8;',
    );
  };

  return (
    <>
      <Button
        isDisabled={importing}
        isLoading={importing}
        onClick={() => fileInput.current?.click()}
        size="small"
        startIcon={<TrayArrowDownIcon />}
        title="Import plant positions from CSV or JSON"
      >
        Import
      </Button>
      <Button
        onClick={exportPlants}
        size="small"
        startIcon={<TrayArrowUpIcon />}
        title="Export positioned plants as CSV"
      >
        Export
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
