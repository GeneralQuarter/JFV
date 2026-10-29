import type { PlainClientAPI } from 'contentful-management';
import { getErrorStatus } from './contentful';

const PLANT_CONTENT_TYPE_ID = 'plant';

const PLANT_ACTIONS = {
  plant: {
    tagId: 'planted',
    dateField: 'plantedAt',
  },
  dead: {
    tagId: 'dead',
    dateField: 'declaredDeadAt',
  },
} as const;

export type PlantAction = keyof typeof PLANT_ACTIONS;

export type PlantActionEntry = {
  sys: {
    id: string;
    version: number;
    contentType: { sys: { id: string } };
  };
  metadata?: {
    tags?: Array<{ sys: { id: string } }>;
  };
  fields: Record<string, unknown>;
};

export type PatchOp = {
  op: 'add' | 'replace';
  path: string;
  value: unknown;
};

export class InvalidPlantEntryError extends Error {
  constructor() {
    super('Entry is not a plant');
    this.name = 'InvalidPlantEntryError';
  }
}

export function buildPlantPatch(
  entry: PlantActionEntry,
  action: PlantAction,
  nowIso: string,
): { ops: PatchOp[]; alreadyApplied: boolean } {
  const config = PLANT_ACTIONS[action];
  const tags = entry.metadata?.tags ?? [];
  const hasTag = tags.some((tag) => tag.sys.id === config.tagId);
  const dateFieldValue = entry.fields[config.dateField];
  const dateContainer =
    dateFieldValue && typeof dateFieldValue === 'object'
      ? (dateFieldValue as { fr?: string })
      : undefined;
  const hasDate =
    typeof dateFieldValue === 'string'
      ? Boolean(dateFieldValue)
      : Boolean(dateContainer?.fr);

  if (hasTag && hasDate) {
    return { ops: [], alreadyApplied: true };
  }

  const ops: PatchOp[] = [];

  if (!hasTag) {
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

  if (!hasDate) {
    ops.push(
      dateFieldValue === undefined
        ? {
            op: 'add',
            path: `/fields/${config.dateField}`,
            value: { fr: nowIso },
          }
        : {
            op: 'replace',
            path: `/fields/${config.dateField}/fr`,
            value: nowIso,
          },
    );
  }

  return { ops, alreadyApplied: false };
}

async function executePlantAction(
  client: PlainClientAPI,
  plantId: string,
  action: PlantAction,
): Promise<void> {
  const entry = await client.entry.get({ entryId: plantId });

  if (entry.sys.contentType.sys.id !== PLANT_CONTENT_TYPE_ID) {
    throw new InvalidPlantEntryError();
  }

  const { ops, alreadyApplied } = buildPlantPatch(
    entry as unknown as PlantActionEntry,
    action,
    new Date().toISOString(),
  );

  if (alreadyApplied) {
    return;
  }

  const updated = await client.entry.patch(
    { entryId: plantId, version: entry.sys.version },
    ops,
  );

  await client.entry.publish({ entryId: plantId }, updated);
}

export async function applyPlantAction(
  client: PlainClientAPI,
  plantId: string,
  action: PlantAction,
): Promise<void> {
  try {
    await executePlantAction(client, plantId, action);
  } catch (error) {
    if (getErrorStatus(error) !== 409) {
      throw error;
    }

    await executePlantAction(client, plantId, action);
  }
}
