import { parse, unparse } from 'papaparse';
import type { CmaEntry } from './entries';
import { entryCode, plantPosition } from './entries';

export type MeasuredPoint = {
  name: string;
  coords: { lat: number; lon: number };
  height: number;
  description?: string;
};

type PointRow = Record<string, string | number | undefined>;

const NAME_KEYS = ['name', 'code', 'plant code'];
const LAT_KEYS = ['latitude', 'lat'];
const LON_KEYS = ['longitude', 'lon', 'lng'];
const HEIGHT_KEYS = ['ellipsoidal height', 'height', 'elevation'];
const DESCRIPTION_KEYS = ['description', 'desc'];

function pick(row: PointRow, keys: string[]): string | undefined {
  for (const [key, value] of Object.entries(row)) {
    if (keys.includes(key.trim().toLowerCase()) && value !== undefined) {
      return String(value);
    }
  }

  return undefined;
}

export function parseMeasuredPointsCsv(text: string): MeasuredPoint[] {
  const parsed = parse<PointRow>(text, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data.flatMap((row) => {
    const name = pick(row, NAME_KEYS)?.trim();
    const lat = Number(pick(row, LAT_KEYS));
    const lon = Number(pick(row, LON_KEYS));

    if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      return [];
    }

    const height = Number(pick(row, HEIGHT_KEYS));

    return [
      {
        coords: { lat, lon },
        description: pick(row, DESCRIPTION_KEYS)?.trim() || undefined,
        height: Number.isFinite(height) ? height : 0,
        name,
      },
    ];
  });
}

export function parsePlantIdsJson(text: string): string[] {
  const data: unknown = JSON.parse(text);

  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((item) => {
    if (typeof item === 'string') {
      return [item];
    }

    if (
      item &&
      typeof item === 'object' &&
      typeof (item as { id?: unknown }).id === 'string'
    ) {
      return [(item as { id: string }).id];
    }

    return [];
  });
}

export function pointToCopyText(point: MeasuredPoint): string {
  return `[${point.coords.lon}, ${point.coords.lat}],`;
}

export function coordsToJsonText(points: MeasuredPoint[]): string {
  return `[\n${points
    .map((point) => `    [${point.coords.lat}, ${point.coords.lon}]`)
    .join(',\n')}\n]`;
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
