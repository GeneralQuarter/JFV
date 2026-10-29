import type { CMAClient } from '@contentful/app-sdk';
import { generateNextPlantCode } from '@jfv/contentful-app';
import type { CmaEntry } from '../entries';
import { localized } from '../entries';

type CreatePlantOptions = {
  card: CmaEntry;
  position: { lat: number; lon: number };
  sponsor: string;
};

export async function createPlant(
  cma: CMAClient,
  { card, position, sponsor }: CreatePlantOptions,
): Promise<CmaEntry> {
  const fullLatinName = localized<string>(card, 'fullLatinName') ?? '';
  const [fallbackGenus, fallbackSpecies] = fullLatinName.split(/\s+/);
  const code = await generateNextPlantCode(cma, {
    genus: localized<string>(card, 'genus') || fallbackGenus || '',
    species: localized<string>(card, 'species') || fallbackSpecies || '',
  });

  const created = await cma.entry.create(
    { contentTypeId: 'plant' },
    {
      fields: {
        code: { fr: code },
        commonInfo: {
          fr: {
            sys: {
              id: card.sys.id,
              linkType: 'Entry',
              type: 'Link',
            },
          },
        },
        position: { fr: position },
        sponsor: { fr: sponsor },
      },
    },
  );

  return cma.entry.publish({ entryId: created.sys.id }, created);
}
