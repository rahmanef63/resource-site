// Type definitions for the migration planner (Phase E of the Slice
// Composition Compiler). Runtime lives in migration-plan.mjs.

import type { SliceContract } from "./contract";

/**
 * Structural diff between two versions of a slice's contract.
 *
 * `renamed.tables` only carries entries the planner could pair up via
 * `to.migrationFrom[fromVersion]` heuristics. Anything ambiguous stays
 * split between `added` and `removed`.
 */
export interface ContractDiff {
  slug: string;
  fromVersion: string;
  toVersion: string;
  added: {
    tables?: string[];
    routes?: string[];
    env?: string[];
    rbac?: string[];
  };
  removed: {
    tables?: string[];
    routes?: string[];
    env?: string[];
    rbac?: string[];
  };
  renamed: {
    tables?: { from: string; to: string }[];
  };
}

/** Discriminator on the concrete operation a migration step performs. */
export type MigrationStepKind =
  | "convex-schema-add-table"
  | "convex-schema-drop-table"
  | "convex-schema-rename-table"
  | "env-add"
  | "env-remove"
  | "rbac-add-permission"
  | "rbac-remove-permission"
  | "route-add"
  | "route-remove";

/** A single, atomic migration step the operator must perform / approve. */
export interface MigrationStep {
  /** Stable id, e.g. "M001-add-table-doku_orders". */
  id: string;
  kind: MigrationStepKind;
  description: string;
  /** True when running the step in reverse can fully undo it. */
  reversible: boolean;
  risk: "low" | "medium" | "high";
  /** Pre-rendered artifacts the operator can paste / write. */
  artifacts: {
    /** Snippet to add to convex/features/<slug>/schema.ts. */
    convexSchema?: string;
    /** Full file body for convex/migrations/<id>.ts. */
    convexMigration?: string;
    /** Line to append to .env.example. */
    envExample?: string;
    /** Patch instructions for the project's RBAC permissions config. */
    rbacPatch?: string;
    /** Free-form operator note (e.g. "Convex has no rename-in-place"). */
    note?: string;
  };
}

/** Final planner output. */
export interface MigrationPlan {
  slug: string;
  fromVersion: string;
  toVersion: string;
  steps: MigrationStep[];
  summary: {
    totalSteps: number;
    highRisk: number;
    irreversible: number;
  };
  /** Free-text concerns surfaced by the planner. */
  warnings: string[];
}

export function diffContracts(from: SliceContract, to: SliceContract): ContractDiff;
export function planMigration(diff: ContractDiff): MigrationPlan;
