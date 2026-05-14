// Type definitions for the slice compose solver (Phase B).
// Runtime in compose-solver.mjs; this file is hand-authored types for
// tsc/IDE consumers. Mirrors the Phase C `dna.d.ts` convention since
// `packages/**` is excluded from the root tsconfig.

import type { SliceContract } from "./contract";

/**
 * The relevant slice of a project's `rr.json` (plus optional ambient
 * data the solver needs but the schema doesn't yet codify).
 *
 * Every field is optional — an empty {} is the canonical "nothing
 * pre-existing" state. The CLI dispatcher fills these from the parsed
 * rr.json plus any environment scans.
 */
export interface RrJsonState {
  /**
   * Target identity provider. Mapped from `rr.json#/auth.provider`
   * ("convex-auth" → "convex") by the CLI dispatcher before passing in.
   */
  auth?: "convex" | "clerk" | "next-auth" | "none";
  /** Env vars already set in target (e.g. parsed from `.env.example`). */
  envExisting?: string[];
  /** RBAC permissions already in target — e.g. "user.read". */
  rbacRolesExisting?: string[];
  /** Slugs already installed (mirrors `rr.json#/slices` + `/features`). */
  slicesInstalled?: string[];
  /** Convex table names already in target schema. */
  convexTablesExisting?: string[];
}

/** Input bundle for {@link compose}. */
export interface ComposeRequest {
  state: RrJsonState;
  /** Slice slugs the user wants to add. */
  desired: string[];
  /**
   * When true (default), the solver pulls in transitive `requires.deps[]`.
   * Set to false to disable BFS dep resolution (CLI `--no-deps`).
   */
  resolveDeps?: boolean;
}

/**
 * Discriminator for {@link Conflict.type}.
 *
 * - `auth-mismatch` — slice requires auth X, target has Y. **blocker**.
 * - `table-collision` — same table declared by 2 candidates, OR slice
 *   declares a table already in `state.convexTablesExisting`. **blocker**.
 * - `rbac-collision` — 2 candidates declare same RBAC permission.
 *   **warning** — operator can decide if sharing is OK.
 * - `missing-dep` — slice declares `requires.deps[X]` but X is neither
 *   in the candidate set nor in `state.slicesInstalled`; ALSO emitted
 *   for desired slugs whose contract is unknown. **blocker**.
 * - `env-missing` — `requires.env[]` ⊄ `state.envExisting`. **warning**.
 * - `explicit-conflict` — slice's `conflicts: ["<other>:<key>.<value>"]`
 *   matched `<other>`'s `provides.<key>` when both are in the candidate
 *   set. **blocker**.
 */
export type ConflictType =
  | "auth-mismatch"
  | "table-collision"
  | "rbac-collision"
  | "missing-dep"
  | "env-missing"
  | "explicit-conflict";

/** A single conflict finding, surfaced in {@link ComposeResult.conflicts}. */
export interface Conflict {
  type: ConflictType;
  /** The slug this finding is anchored on. */
  slug: string;
  /** Human-readable explanation. */
  detail: string;
  /** When the conflict is between two slices, the other slug. */
  withSlug?: string;
  /**
   * `"blocker"` causes the slice to be rejected.
   * `"warning"` is informational and never blocks acceptance.
   */
  severity: "blocker" | "warning";
}

/** Output bundle from {@link compose}. */
export interface ComposeResult {
  /** Slugs the solver would install (in BFS-discovery order). */
  accepted: string[];
  /** Slugs the solver rejected, with the reasons attached. */
  rejected: { slug: string; reasons: Conflict[] }[];
  /** All conflicts surfaced, including warning-level. */
  conflicts: Conflict[];
  /** Union of `requires.env` from accepted slices not in `state.envExisting`. */
  envMissing: string[];
  /** Union of `requires.rbac` from accepted slices not in `state.rbacRolesExisting`. */
  rbacToCreate: string[];
  /** Per-slice table additions, useful for printing schema previews. */
  tablesAdded: { slug: string; tables: string[] }[];
  /** Human-readable trace of every decision the solver made. */
  proof: string[];
}

/**
 * Discover every `slice.contract.ts` under `<repoRoot>/frontend/slices/` and
 * `<repoRoot>/template-base/frontend/slices/`, then dynamic-import each via
 * tsx and return them keyed by `contract.id`. Contracts whose loader throws
 * are silently skipped (a future iteration may surface them).
 */
export function loadAllContracts(
  repoRoot: string,
): Promise<Map<string, SliceContract>>;

/**
 * Greedy compose solver. Pure — no I/O. Returns a fresh {@link ComposeResult};
 * does not mutate `req` or `contracts`.
 *
 * Algorithm: BFS resolve transitive deps (capped depth 16; throws on cycle),
 * then run conflict checks against state + sibling candidates. When a blocker
 * pair appears, both candidates are rejected unless one is already in
 * `state.slicesInstalled` (in which case the installed slice wins and only
 * the new one is rejected).
 *
 * Limitations of v1: greedy reject-both is not optimal — a smarter version
 * would rank candidates by "most-dependers-first" and drop the loser only.
 * For now this is acceptable; the operator can re-run with a smaller
 * `desired` set after seeing the proof.
 *
 * @throws Error when a dep cycle is detected (message includes "cycle").
 */
export function compose(
  req: ComposeRequest,
  contracts: Map<string, SliceContract>,
): ComposeResult;
