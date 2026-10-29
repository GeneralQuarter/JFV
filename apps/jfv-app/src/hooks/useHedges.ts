import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db/db';

export default function useHedges() {
  return useLiveQuery(async () => {
    return await db.hedges.filter((hedge) => !!hedge.coords).toArray();
  });
}
