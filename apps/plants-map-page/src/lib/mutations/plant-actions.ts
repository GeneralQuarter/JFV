import type { CMAClient } from '@contentful/app-sdk';
import { TAG_IDS } from '@jfv/core/domain';
import {
  addEntryTag,
  type CmaEntry,
  entryCode,
  entryTags,
  setLocalizedDate,
} from '../entries';

export type QuickAction = 'pin' | 'plant' | 'dead';

type ActionConfig = {
  tagId: string;
  dateField?: string;
};

const ACTION_CONFIG: Record<QuickAction, ActionConfig> = {
  pin: {
    tagId: TAG_IDS.pinned,
  },
  plant: {
    tagId: TAG_IDS.planted,
    dateField: 'plantedAt',
  },
  dead: {
    tagId: TAG_IDS.dead,
    dateField: 'declaredDeadAt',
  },
};

type PatchOp = {
  op: 'add' | 'replace';
  path: string;
  value: unknown;
};

function hasDate(entry: CmaEntry, field: string): boolean {
  const value = entry.fields[field];

  if (typeof value === 'string') {
    return Boolean(value);
  }

  return Boolean(
    value &&
      typeof value === 'object' &&
      'fr' in value &&
      (value as { fr?: string }).fr,
  );
}

function buildPlantPatch(
  entry: CmaEntry,
  action: QuickAction,
  date: Date,
): PatchOp[] {
  const config = ACTION_CONFIG[action];
  const ops: PatchOp[] = [];

  if (!entryTags(entry).includes(config.tagId)) {
    ops.push({
      op: 'add',
      path: '/metadata/tags/-',
      value: {
        sys: {
          id: config.tagId,
          linkType: 'Tag',
          type: 'Link',
        },
      },
    });
  }

  if (config.dateField && !hasDate(entry, config.dateField)) {
    const existing = entry.fields[config.dateField];

    ops.push(
      existing === undefined
        ? {
            op: 'add',
            path: `/fields/${config.dateField}`,
            value: { fr: date.toISOString() },
          }
        : {
            op: 'replace',
            path: `/fields/${config.dateField}/fr`,
            value: date.toISOString(),
          },
    );
  }

  return ops;
}

export async function applyPlantQuickAction(
  cma: CMAClient,
  plantId: string,
  action: QuickAction,
  date: Date,
): Promise<void> {
  const entry = await cma.entry.get({ entryId: plantId });

  if (entry.sys.contentType.sys.id !== 'plant') {
    throw new Error('Entry is not a plant');
  }

  const ops = buildPlantPatch(entry, action, date);

  if (ops.length === 0) {
    return;
  }

  const updated = await cma.entry.patch(
    { entryId: plantId, version: entry.sys.version },
    ops,
  );

  await cma.entry.publish({ entryId: plantId }, updated);
}

export function applyLocalPlantAction(
  entry: CmaEntry,
  action: QuickAction,
  date: Date,
): void {
  const config = ACTION_CONFIG[action];

  addEntryTag(entry, config.tagId);

  if (config.dateField) {
    setLocalizedDate(entry, config.dateField, date);
  }
}

export async function findPlantByCode(
  cma: CMAClient,
  code: string,
): Promise<CmaEntry | undefined> {
  const normalized = code.trim().toLowerCase();
  const collection = await cma.entry.getMany({
    query: {
      content_type: 'plant',
      'fields.code[match]': code.trim(),
      limit: 10,
    },
  });

  return collection.items.find(
    (entry) => entryCode(entry).trim().toLowerCase() === normalized,
  );
}

export async function updatePlantPosition(
  cma: CMAClient,
  plantId: string,
  position: { lat: number; lon: number },
): Promise<CmaEntry> {
  const entry = await cma.entry.get({ entryId: plantId });

  if (entry.sys.contentType.sys.id !== 'plant') {
    throw new Error('Entry is not a plant');
  }

  const hasPosition = entry.fields.position !== undefined;
  const updated = await cma.entry.patch(
    { entryId: plantId, version: entry.sys.version },
    [
      {
        op: hasPosition ? 'replace' : 'add',
        path: hasPosition ? '/fields/position/fr' : '/fields/position',
        value: hasPosition ? position : { fr: position },
      },
    ],
  );

  return cma.entry.publish({ entryId: plantId }, updated);
}

export function setLocalPlantPosition(
  entry: CmaEntry,
  position: { lat: number; lon: number },
): void {
  entry.fields.position = { fr: position };
}
