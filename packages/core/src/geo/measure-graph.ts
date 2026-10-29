import type { LatLngTuple } from '../domain/models';

export type MeasureNode = {
  id: string;
  position: LatLngTuple;
};

export type MeasureEdge = [aId: string, bId: string];

export type MeasureGraph = {
  nodes: Record<string, MeasureNode>;
  edges: MeasureEdge[];
};

export const emptyMeasureGraph: MeasureGraph = {
  nodes: {},
  edges: [],
};

function isSameEdge(a: MeasureEdge, b: MeasureEdge): boolean {
  return (a[0] === b[0] && a[1] === b[1]) || (a[0] === b[1] && a[1] === b[0]);
}

function hasEdge(graph: MeasureGraph, edge: MeasureEdge): boolean {
  return graph.edges.some((current) => isSameEdge(current, edge));
}

function hasEdgeWith(graph: MeasureGraph, id: string): boolean {
  return graph.edges.some(([a, b]) => a === id || b === id);
}

export function addMeasure(
  graph: MeasureGraph,
  a: MeasureNode,
  b: MeasureNode,
): MeasureGraph {
  if (a.id === b.id) {
    return graph;
  }

  const nodes = { ...graph.nodes };
  let changed = false;

  if (!nodes[a.id]) {
    nodes[a.id] = a;
    changed = true;
  }

  if (!nodes[b.id]) {
    nodes[b.id] = b;
    changed = true;
  }

  const edge: MeasureEdge = [a.id, b.id];

  if (hasEdge(graph, edge)) {
    return changed ? { ...graph, nodes } : graph;
  }

  return {
    nodes,
    edges: [...graph.edges, edge],
  };
}

export function removeMeasure(
  graph: MeasureGraph,
  edge: MeasureEdge,
): MeasureGraph {
  if (!hasEdge(graph, edge)) {
    return graph;
  }

  const edges = graph.edges.filter((current) => !isSameEdge(current, edge));
  const nodes = { ...graph.nodes };

  if (!hasEdgeWith({ nodes, edges }, edge[0])) {
    delete nodes[edge[0]];
  }

  if (!hasEdgeWith({ nodes, edges }, edge[1])) {
    delete nodes[edge[1]];
  }

  return { nodes, edges };
}
