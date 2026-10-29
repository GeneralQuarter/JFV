import type { CMAClient } from '@contentful/app-sdk';
import type { CmaEntry } from '../entries';
import type { LatLon } from '../geo';

type ShapeContentType = 'rectangle' | 'mapZone';

async function updateShapeCoords(
  cma: CMAClient,
  entryId: string,
  contentType: ShapeContentType,
  coords: LatLon[],
): Promise<void> {
  const entry = await cma.entry.get({ entryId });

  if (entry.sys.contentType.sys.id !== contentType) {
    throw new Error(`Entry is not a ${contentType}`);
  }

  const hasCoords = entry.fields.coords !== undefined;
  const updated = await cma.entry.patch(
    { entryId, version: entry.sys.version },
    [
      {
        op: hasCoords ? 'replace' : 'add',
        path: hasCoords ? '/fields/coords/fr' : '/fields/coords',
        value: hasCoords ? coords : { fr: coords },
      },
    ],
  );

  await cma.entry.publish({ entryId }, updated);
}

export async function updateRectangleCoords(
  cma: CMAClient,
  entryId: string,
  coords: LatLon[],
): Promise<void> {
  await updateShapeCoords(cma, entryId, 'rectangle', coords);
}

export async function updateMapZoneCoords(
  cma: CMAClient,
  entryId: string,
  coords: LatLon[],
): Promise<void> {
  await updateShapeCoords(cma, entryId, 'mapZone', coords);
}

export function setLocalCoords(entry: CmaEntry, coords: LatLon[]): void {
  entry.fields.coords = { fr: coords };
}
