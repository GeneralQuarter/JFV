import { TAG_IDS } from '@jfv/core/domain';
import { produce } from 'immer';
import { create } from 'zustand';
import { HUE_COUNT } from '../lib/colors';

export type SelectedTag = {
  id: string;
  hueIndex: number;
};

type SelectedTagsState = {
  selected: SelectedTag[];
  toggleTag: (tagId: string) => void;
  clearTags: () => void;
};

const useSelectedTags = create<SelectedTagsState>((set) => ({
  selected: [{ hueIndex: 0, id: TAG_IDS.planted }],
  toggleTag: (tagId: string) => {
    set(
      produce((state: SelectedTagsState) => {
        const index = state.selected.findIndex((tag) => tag.id === tagId);

        if (index !== -1) {
          state.selected.splice(index, 1);
          return;
        }

        const usedHues = new Set(state.selected.map((tag) => tag.hueIndex));
        let hueIndex = 0;

        while (usedHues.has(hueIndex)) {
          hueIndex += 1;
        }

        if (hueIndex >= HUE_COUNT) {
          return;
        }

        state.selected.push({ hueIndex, id: tagId });
      }),
    );
  },
  clearTags: () => {
    set({ selected: [] });
  },
}));

export default useSelectedTags;
