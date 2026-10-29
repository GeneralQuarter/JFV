import type { EntryProps, KeyValueMap } from 'contentful-management';
import type { Feature, Polygon } from 'geojson';

export type CmaEntry = EntryProps<KeyValueMap>;

export function localized<T>(entry: CmaEntry, field: string): T | undefined {
  return entry.fields[field]?.fr as T | undefined;
}

export function entryTags(entry: CmaEntry): string[] {
  return entry.metadata?.tags?.map((tag) => tag.sys.id) ?? [];
}

export function entryName(entry: CmaEntry): string {
  return (localized<string>(entry, 'name') ?? '') as string;
}

export function entryCode(entry: CmaEntry): string {
  return (localized<string>(entry, 'code') ?? '') as string;
}

export function entryCoords(
  entry: CmaEntry,
): [lat: number, lon: number][] | undefined {
  return localized<[lat: number, lon: number][]>(entry, 'coords');
}

export function plantPosition(
  entry: CmaEntry,
): { lat: number; lon: number } | undefined {
  return localized<{ lat: number; lon: number }>(entry, 'position');
}

export function plantCardId(entry: CmaEntry): string | undefined {
  return entry.fields.commonInfo?.fr?.sys?.id as string | undefined;
}

export function mapSectorGeoJson(
  entry: CmaEntry,
): Feature<Polygon> | undefined {
  return localized<Feature<Polygon>>(entry, 'geojson');
}

export function addEntryTag(entry: CmaEntry, tagId: string): void {
  const tags = entry.metadata?.tags ?? [];

  if (tags.some((tag) => tag.sys.id === tagId)) {
    return;
  }

  entry.metadata = {
    ...entry.metadata,
    tags: [
      ...tags,
      {
        sys: {
          id: tagId,
          linkType: 'Tag',
          type: 'Link',
        },
      },
    ],
  };
}

export function setLocalizedDate(
  entry: CmaEntry,
  field: string,
  date: Date,
): void {
  const current = entry.fields[field] as Record<string, unknown> | undefined;

  entry.fields[field] = {
    ...current,
    fr: date.toISOString(),
  };
}
