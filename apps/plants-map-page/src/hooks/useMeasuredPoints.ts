import { create } from 'zustand';
import type { MeasuredPoint } from '../lib/points';

type MeasuredPointsState = {
  points: MeasuredPoint[];
  setPoints: (points: MeasuredPoint[]) => void;
  clearPoints: () => void;
};

const useMeasuredPoints = create<MeasuredPointsState>((set) => ({
  points: [],
  setPoints: (points) => set({ points }),
  clearPoints: () => set({ points: [] }),
}));

export default useMeasuredPoints;
