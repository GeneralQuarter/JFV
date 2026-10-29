import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db/db';

export default function useRectangles() {
  return useLiveQuery(async () =>
    db.rectangles.filter((rectangle) => !!rectangle.coords).toArray(),
  );
}
