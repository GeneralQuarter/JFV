import { describe, expect, it } from 'vitest';
import { buildPlantPatch, type PlantActionEntry } from '../lib/plant-actions';

const now = '2026-10-29T10:00:00.000Z';

function makeEntry(
  overrides: Partial<PlantActionEntry> = {},
): PlantActionEntry {
  return {
    sys: {
      id: 'plant-1',
      version: 1,
      contentType: { sys: { id: 'plant' } },
    },
    metadata: { tags: [] },
    fields: {},
    ...overrides,
  };
}

describe('buildPlantPatch', () => {
  it('adds the planted tag and date when neither exists', () => {
    const result = buildPlantPatch(makeEntry(), 'plant', now);

    expect(result.alreadyApplied).toBe(false);
    expect(result.ops).toEqual([
      {
        op: 'add',
        path: '/metadata/tags/-',
        value: {
          sys: { id: 'planted', linkType: 'Tag', type: 'Link' },
        },
      },
      {
        op: 'add',
        path: '/fields/plantedAt',
        value: { fr: now },
      },
    ]);
  });

  it('adds the dead tag and declaredDeadAt for the dead action', () => {
    const result = buildPlantPatch(makeEntry(), 'dead', now);

    expect(result.ops).toEqual([
      {
        op: 'add',
        path: '/metadata/tags/-',
        value: {
          sys: { id: 'dead', linkType: 'Tag', type: 'Link' },
        },
      },
      {
        op: 'add',
        path: '/fields/declaredDeadAt',
        value: { fr: now },
      },
    ]);
  });

  it('does nothing when the tag and date already exist', () => {
    const result = buildPlantPatch(
      makeEntry({
        metadata: { tags: [{ sys: { id: 'planted' } }] },
        fields: { plantedAt: { fr: now } },
      }),
      'plant',
      now,
    );

    expect(result).toEqual({ ops: [], alreadyApplied: true });
  });

  it('adds only the missing date when the tag exists', () => {
    const result = buildPlantPatch(
      makeEntry({
        metadata: { tags: [{ sys: { id: 'planted' } }] },
      }),
      'plant',
      now,
    );

    expect(result.ops).toEqual([
      {
        op: 'add',
        path: '/fields/plantedAt',
        value: { fr: now },
      },
    ]);
  });

  it('adds only the missing tag when the date exists', () => {
    const result = buildPlantPatch(
      makeEntry({
        fields: { plantedAt: { fr: now } },
      }),
      'plant',
      now,
    );

    expect(result.ops).toEqual([
      {
        op: 'add',
        path: '/metadata/tags/-',
        value: {
          sys: { id: 'planted', linkType: 'Tag', type: 'Link' },
        },
      },
    ]);
  });

  it('replaces an empty localized date object', () => {
    const result = buildPlantPatch(
      makeEntry({
        metadata: { tags: [{ sys: { id: 'planted' } }] },
        fields: { plantedAt: {} },
      }),
      'plant',
      now,
    );

    expect(result.ops).toEqual([
      {
        op: 'replace',
        path: '/fields/plantedAt/fr',
        value: now,
      },
    ]);
  });
});
