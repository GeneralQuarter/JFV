import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '../lib/db/db';
import type { Tag } from '../lib/db/entities/tag';

export default function useTags(): [Tag[], Record<string, string>] {
  const _tags = useLiveQuery(async () => await db.tags.toArray());
  const tags = useMemo<Tag[]>(() => _tags ?? [], [_tags]);
  const tagMap = useMemo<Record<string, string>>(() => {
    return tags.reduce(
      (acc, { id, label }) => {
        acc[id] = label;
        return acc;
      },
      {} as Record<string, string>,
    );
  }, [tags]);
  return [tags, tagMap];
}
