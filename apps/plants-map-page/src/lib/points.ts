import { parse, unparse } from 'papaparse';
import type { CmaEntry } from './entries';
import { entryCode, plantPosition } from './entries';

export type ImportedPoint = {
  code: string;
  lat: number;
  lon: number;
};

type PointRow = Record<string, string | number | undefined>;

const CODE_KEYS = ['name', 'code', 'plant code'];
const LAT_KEYS = ['latitude', 'lat'];
const LON_KEYS = ['longitude', 'lon', 'lng'];

function pick(row: PointRow, keys: string[]): string | undefined {
  const entries = Object.entries(row);

  for (const [key, value] of entries) {
    if (keys.includes(key.trim().toLowerCase()) && value !== undefined) {
      return String(value);
    }
  }

  return undefined;
}

function rowToPoint(row: PointRow): ImportedPoint | undefined {
  const code = pick(row, CODE_KEYS)?.trim();
  const lat = Number(pick(row, LAT_KEYS));
  const lon = Number(pick(row, LON_KEYS));

  if (!code || !Number.isFinite(lat) || !Number.isFinite(lon)) {
    return undefined;
  }

  return { code, lat, lon };
}

function rowsToPoints(rows: PointRow[]): ImportedPoint[] {
  return rows
    .map(rowToPoint)
    .filter((point): point is ImportedPoint => point !== undefined);
}

export function parsePointsFile(
  text: string,
  fileName: string,
): ImportedPoint[] {
  if (fileName.toLowerCase().endsWith('.json')) {
    const data: unknown = JSON.parse(text);

    if (!Array.isArray(data)) {
      return [];
    }

    return rowsToPoints(data as PointRow[]);
  }

  const parsed = parse<PointRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  return rowsToPoints(parsed.data);
}

export function plantsToCsv(plants: CmaEntry[]): string {
  const rows = plants.flatMap((plant) => {
    const position = plantPosition(plant);

    if (!position) {
      return [];
    }

    return [
      {
        Name: entryCode(plant),
        Longitude: position.lon.toFixed(8),
        Latitude: position.lat.toFixed(8),
        Elevation: '0.0',
      },
    ];
  });

  return unparse(rows);
}

export function downloadText(
  fileName: string,
  content: string,
  type: string,
): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
