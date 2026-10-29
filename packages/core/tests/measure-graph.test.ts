import { describe, expect, it } from 'vitest';
import {
  addMeasure,
  emptyMeasureGraph,
  type MeasureNode,
  removeMeasure,
} from '../src/geo/measure-graph';

const a: MeasureNode = { id: 'a', position: [1, 2] };
const b: MeasureNode = { id: 'b', position: [3, 4] };
const c: MeasureNode = { id: 'c', position: [5, 6] };

describe('measure graph', () => {
  it('adds nodes and an edge', () => {
    const graph = addMeasure(emptyMeasureGraph, a, b);

    expect(graph.nodes).toEqual({ a, b });
    expect(graph.edges).toEqual([['a', 'b']]);
  });

  it('does not add the same edge twice', () => {
    const graph = addMeasure(addMeasure(emptyMeasureGraph, a, b), b, a);

    expect(graph.edges).toEqual([['a', 'b']]);
  });

  it('does not duplicate nodes when a second edge is added', () => {
    const graph = addMeasure(addMeasure(emptyMeasureGraph, a, b), b, c);

    expect(Object.keys(graph.nodes)).toEqual(['a', 'b', 'c']);
    expect(graph.edges).toEqual([
      ['a', 'b'],
      ['b', 'c'],
    ]);
  });

  it('removes an edge and orphaned nodes', () => {
    const graph = addMeasure(emptyMeasureGraph, a, b);
    const removed = removeMeasure(graph, ['a', 'b']);

    expect(removed).toEqual(emptyMeasureGraph);
  });

  it('keeps nodes that still have another edge', () => {
    const graph = addMeasure(addMeasure(emptyMeasureGraph, a, b), b, c);
    const removed = removeMeasure(graph, ['a', 'b']);

    expect(Object.keys(removed.nodes)).toEqual(['b', 'c']);
    expect(removed.edges).toEqual([['b', 'c']]);
  });

  it('ignores removal of an unknown edge', () => {
    const graph = addMeasure(emptyMeasureGraph, a, b);

    expect(removeMeasure(graph, ['b', 'c'])).toBe(graph);
  });
});
