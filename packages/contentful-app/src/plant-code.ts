import type { CMAClient } from '@contentful/app-sdk';
import { formatPlantCodeNumber, plantCodePrefix } from '@jfv/core/domain';
import type { QueryOptions } from 'contentful-management';

export type GenerateNextPlantCodeOptions = {
  genus: string;
  species: string;
  excludeEntryId?: string;
  contentTypeId?: string;
};

export async function generateNextPlantCode(
  cma: CMAClient,
  options: GenerateNextPlantCodeOptions,
): Promise<string> {
  const codeStart = `${plantCodePrefix(options.genus, options.species)}-`;
  const query: QueryOptions = {
    content_type: options.contentTypeId ?? 'plant',
    'fields.code[match]': codeStart,
    order: '-fields.code',
    limit: 1,
  };

  if (options.excludeEntryId) {
    query['sys.id[ne]'] = options.excludeEntryId;
  }

  const results = await cma.entry.getMany({ query });

  if (results.total === 0) {
    return `${codeStart}${formatPlantCodeNumber(1)}`;
  }

  const lastCode = results.items[0]?.fields?.code?.fr;
  const lastNumber = Number.parseInt(
    String(lastCode ?? '').split('-')[1] ?? '',
    10,
  );

  return `${codeStart}${formatPlantCodeNumber(
    Number.isFinite(lastNumber) ? lastNumber + 1 : 1,
  )}`;
}
