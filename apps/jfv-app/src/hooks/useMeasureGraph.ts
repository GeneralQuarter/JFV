import {
  addMeasure,
  emptyMeasureGraph,
  type MeasureEdge,
  type MeasureGraph,
  type MeasureNode,
  removeMeasure,
} from '@jfv/core/geo';
import { useCallback, useState } from 'react';

type UseMeasureGraph = [
  graph: MeasureGraph,
  add: (a: MeasureNode, b: MeasureNode) => void,
  remove: (edge: MeasureEdge) => void,
];

export default function useMeasureGraph(): UseMeasureGraph {
  const [graph, setGraph] = useState<MeasureGraph>(emptyMeasureGraph);

  const add = useCallback((a: MeasureNode, b: MeasureNode) => {
    setGraph((current) => addMeasure(current, a, b));
  }, []);

  const remove = useCallback((edge: MeasureEdge) => {
    setGraph((current) => removeMeasure(current, edge));
  }, []);

  return [graph, add, remove];
}
