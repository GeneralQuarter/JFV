import { create } from 'zustand';
import type { LatLon } from '../lib/geo';

type SectorDrawingState = {
  isDrawing: boolean;
  vertices: LatLon[];
  pending?: LatLon[];
  start: () => void;
  addVertex: (point: LatLon) => void;
  undo: () => void;
  cancel: () => void;
  finish: () => void;
  clearPending: () => void;
};

const useSectorDrawing = create<SectorDrawingState>((set, get) => ({
  isDrawing: false,
  vertices: [],
  pending: undefined,
  start: () => set({ isDrawing: true, pending: undefined, vertices: [] }),
  addVertex: (point) =>
    set((state) => ({ vertices: [...state.vertices, point] })),
  undo: () => set((state) => ({ vertices: state.vertices.slice(0, -1) })),
  cancel: () => set({ isDrawing: false, pending: undefined, vertices: [] }),
  finish: () => {
    const { vertices } = get();

    if (vertices.length < 3) {
      return;
    }

    set({ isDrawing: false, pending: vertices, vertices: [] });
  },
  clearPending: () => set({ pending: undefined }),
}));

export default useSectorDrawing;
