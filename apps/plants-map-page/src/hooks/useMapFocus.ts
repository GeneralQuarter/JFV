import { create } from 'zustand';

export type MapFocusTarget = {
  lat: number;
  lon: number;
  zoom?: number;
};

type MapFocusState = {
  target?: MapFocusTarget;
  focus: (target: MapFocusTarget) => void;
  clear: () => void;
};

const useMapFocus = create<MapFocusState>((set) => ({
  target: undefined,
  focus: (target) => set({ target }),
  clear: () => set({ target: undefined }),
}));

export default useMapFocus;
