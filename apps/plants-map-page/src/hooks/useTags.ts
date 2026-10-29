import type { CMAClient } from '@contentful/app-sdk';
import { t } from '@lingui/core/macro';
import { create } from 'zustand';
import { MARKED_TAG_ID } from '../lib/keys';

const LOCAL_TAGS: Record<string, string> = {
  [MARKED_TAG_ID]: 'Marked',
};

type TagsState = {
  tags: Record<string, string>;
  loading: boolean;
  loaded: boolean;
  error?: string;
  fetchTags: (cma: CMAClient) => Promise<void>;
};

const useTags = create<TagsState>((set, get) => ({
  tags: { ...LOCAL_TAGS },
  loading: false,
  loaded: false,
  error: undefined,
  fetchTags: async (cma: CMAClient) => {
    if (get().loading) {
      return;
    }

    set({ error: undefined, loading: true });

    try {
      const collection = await cma.tag.getMany({ query: { limit: 1000 } });
      const tags = collection.items.reduce<Record<string, string>>(
        (acc, tag) => {
          acc[tag.sys.id] = tag.name;

          return acc;
        },
        {},
      );

      set({ loaded: true, loading: false, tags: { ...LOCAL_TAGS, ...tags } });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : t`Could not load tags`,
        loading: false,
      });
    }
  },
}));

export default useTags;
