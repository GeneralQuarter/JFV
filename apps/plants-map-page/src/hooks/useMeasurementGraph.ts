import {
  addMeasure,
  type MeasureEdge,
  type MeasureGraph,
  type MeasureNode,
  removeMeasure,
} from '@jfv/core/geo';
import { create } from 'zustand';

type MeasurementGraphState = {
  graph: MeasureGraph;
  addMeasurement: (a: MeasureNode, b: MeasureNode) => void;
  removeMeasurement: (edge: MeasureEdge) => void;
  clearMeasurements: () => void;
};

const useMeasurementGraph = create<MeasurementGraphState>((set) => ({
  graph: { nodes: {}, edges: [] },
  addMeasurement: (a, b) => {
    set((state) => ({ graph: addMeasure(state.graph, a, b) }));
  },
  removeMeasurement: (edge) => {
    set((state) => ({ graph: removeMeasure(state.graph, edge) }));
  },
  clearMeasurements: () => {
    set({ graph: { nodes: {}, edges: [] } });
  },
}));

export default useMeasurementGraph;
