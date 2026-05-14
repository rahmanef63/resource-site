// Type definitions for the slice-DNA lineage tracker.
// Runtime in dna.mjs; this file is hand-authored types for tsc/ide consumers.

export interface LineageEntry {
  /** "<sourceRepo>:<path>" — e.g. "superspace:frontend/slices/auth". */
  from: string;
  /** Optional destination, e.g. "kitab:0.7.0" or "careerpack:adopt". */
  to?: string;
  /** ISO 8601 UTC timestamp. */
  at: string;
  /** Transform tags applied during the harvest (e.g. "alias-rewrite", "clerk-strip"). */
  transforms: string[];
  /** Human/agent that triggered the lineage entry. */
  actor?: string;
}

export interface ConsumerAdoption {
  adopted_at: string;
  version: string;
  /** 0-100, computed from file diff between kitab and consumer. */
  drift_score: number;
  last_synced_at?: string;
}

export interface SliceDNA {
  /** Slice slug, kebab-case. */
  id: string;
  created_at: string;
  lineage: LineageEntry[];
  /** Keyed by consumer name (notion, superspace, careerpack, content, rahmanef, cescadesigns). */
  consumers: Record<string, ConsumerAdoption>;
}

export interface LineageGraphNode {
  id: string;
  type: "slice" | "consumer" | "source";
}

export interface LineageGraphEdge {
  from: string;
  to: string;
  transforms?: string[];
  at: string;
}

export interface LineageGraph {
  nodes: LineageGraphNode[];
  edges: LineageGraphEdge[];
}

export function readDNA(slug: string): SliceDNA | null;
export function writeDNA(dna: SliceDNA): void;
export function appendLineage(slug: string, entry: LineageEntry): SliceDNA;
export function upsertConsumerAdoption(
  slug: string,
  consumer: string,
  adoption: ConsumerAdoption,
): SliceDNA;
export function listAllDNA(): SliceDNA[];
export function buildLineageGraph(): LineageGraph;

/** Resolve the absolute path to `.kitab/lineage/`. */
export function getLineageDir(): string;
/** Resolve the absolute path to `.kitab/lineage/<slug>.dna.json`. */
export function getDNAPath(slug: string): string;
