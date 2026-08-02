// Type definitions for the 3-way semantic slice-element merge engine.
// Runtime in merge3.mjs.

import type { SliceContract } from "./contract";

export interface SliceSnapshot {
  /** Slice slug, kebab-case. */
  slug: string;
  /** Semver of the snapshot. */
  version: string;
  /** Map of relative path → file content. */
  files: Record<string, string>;
  /** Parsed contract, if a slice.contract.ts was present. */
  contract?: SliceContract;
}

export interface MergeRequest {
  /** Common ancestor — last kitab version the consumer adopted. */
  base: SliceSnapshot;
  /** Latest kitab version. */
  kitab: SliceSnapshot;
  /** Consumer's current state — may have local edits. */
  consumer: SliceSnapshot;
}

export type MergeOutcomeKind =
  | "auto-merged"
  | "consumer-wins-clean"
  | "kitab-wins-clean"
  | "conflict"
  | "identical";

export interface ElementOutcome {
  /** Semantic key — e.g. "files/page.tsx", "contract.requires.env",
   *  "contract.provides.tables". For set elements, the suffix encodes the
   *  member (e.g. "contract.provides.tables:auth_users"). */
  element: string;
  kind: MergeOutcomeKind;
  baseValue?: string | string[] | null;
  kitabValue?: string | string[] | null;
  consumerValue?: string | string[] | null;
  /** The merged value, present when kind !== "conflict". */
  mergedValue?: string | string[] | null;
  /** Human-readable suggestion when kind === "conflict". */
  conflictHint?: string;
}

export interface MergeSummary {
  autoMerged: number;
  kitabWinsClean: number;
  consumerWinsClean: number;
  conflicts: number;
  identical: number;
}

export interface MergeReport {
  slug: string;
  outcomes: ElementOutcome[];
  summary: MergeSummary;
  /** 0-100, 0 = perfectly synced, higher = more divergence. */
  driftAfterMerge: number;
  /** Present only when no conflicts (clean auto-merge). */
  mergedSnapshot?: SliceSnapshot;
}

export function merge3(req: MergeRequest): MergeReport;
export function applyMerge(report: MergeReport, targetDir: string): Promise<void>;
