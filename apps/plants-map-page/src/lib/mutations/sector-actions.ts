import type { CMAClient } from '@contentful/app-sdk';
import type { Feature, Polygon } from 'geojson';
import type { CmaEntry } from '../entries';
import { closeRing, type LatLon } from '../geo';

export async function createSector(
  cma: CMAClient,
  name: string,
  ring: LatLon[],
): Promise<CmaEntry> {
  const geojson: Feature<Polygon> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [closeRing(ring)],
    },
  };

  const created = await cma.entry.create(
    { contentTypeId: 'mapSector' },
    {
      fields: {
        geojson: { fr: geojson },
        name: { fr: name },
      },
    },
  );

  return cma.entry.publish({ entryId: created.sys.id }, created);
}
