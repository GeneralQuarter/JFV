import { produce } from 'immer';
import { create } from 'zustand';

export type SelectedFeature = {
  id: string;
  type: string;
};

type MapSelectionState = {
  hoveredId: string | undefined;
  selectedFeatures: SelectedFeature[];
  hover: (id: string) => void;
  selectFeature: (item: SelectedFeature) => void;
  toggleSelect: (item: SelectedFeature, clearSelected: boolean) => void;
  clearSelected: () => void;
  clearHovered: () => void;
};

const useMapSelection = create<MapSelectionState>((set) => ({
  hoveredId: undefined,
  selectedFeatures: [],
  hover: (id: string) => {
    set(
      produce((state: MapSelectionState) => {
        state.hoveredId = id;
      }),
    );
  },
  selectFeature: (item: SelectedFeature) => {
    set(
      produce((state: MapSelectionState) => {
        state.selectedFeatures = [item];
      }),
    );
  },
  toggleSelect: (item: SelectedFeature, clearPreviousSelection: boolean) => {
    set(
      produce((state: MapSelectionState) => {
        const index = state.selectedFeatures.findIndex((s) => s.id === item.id);

        if (clearPreviousSelection) {
          state.selectedFeatures = [];
        }

        if (index === -1) {
          state.selectedFeatures.push(item);
        } else {
          state.selectedFeatures.splice(index, 1);
        }
      }),
    );
  },
  clearHovered: () => {
    set(
      produce((state: MapSelectionState) => {
        state.hoveredId = undefined;
      }),
    );
  },
  clearSelected: () => {
    set(
      produce((state: MapSelectionState) => {
        state.selectedFeatures = [];
      }),
    );
  },
}));

export default useMapSelection;
