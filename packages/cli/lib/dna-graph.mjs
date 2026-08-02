// dna-graph.mjs — lineage graph builder.
//
// Extracted from dna.mjs. Reads all DNA files via `listAllDNA` and produces
// a node/edge graph keyed by source / slice / consumer.

import { listAllDNA } from "./dna.mjs";

/** @returns {import("./dna").LineageGraph} */
export function buildLineageGraph() {
  const all = listAllDNA();
  /** @type {Map<string, import("./dna").LineageGraphNode>} */
  const nodes = new Map();
  /** @type {import("./dna").LineageGraphEdge[]} */
  const edges = [];

  function addNode(id, type) {
    if (!nodes.has(id)) nodes.set(id, { id, type });
  }

  for (const dna of all) {
    const sliceId = `slice:${dna.id}`;
    addNode(sliceId, "slice");

    // lineage edges: source → slice
    for (const entry of dna.lineage ?? []) {
      const sourceId = `source:${entry.from}`;
      addNode(sourceId, "source");
      // If `to` looks like a different slice / kitab tag, prefer the slice node;
      // otherwise treat `to` as the kitab itself and target the slice node.
      const targetId = entry.to && entry.to.startsWith("kitab:") ? sliceId : sliceId;
      edges.push({
        from: sourceId,
        to: targetId,
        transforms: entry.transforms,
        at: entry.at,
      });
    }

    // consumer edges: slice → consumer
    for (const [consumerName, adoption] of Object.entries(dna.consumers ?? {})) {
      const consumerId = `consumer:${consumerName}`;
      addNode(consumerId, "consumer");
      edges.push({
        from: sliceId,
        to: consumerId,
        transforms: [`drift:${adoption.drift_score}`, `v${adoption.version}`],
        at: adoption.adopted_at,
      });
    }
  }

  return { nodes: [...nodes.values()], edges };
}
