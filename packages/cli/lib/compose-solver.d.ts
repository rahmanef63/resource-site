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
  /**
   * When `true` (default), a desired slug with no registered contract is
   * surfaced as an `uncontracted` warning and accepted with a `note`. When
   * `false` (e.g. `--strict`), it becomes a blocker `missing-dep`. Useful for
   * gradual migrations where most slices are still un-contracted.
   */
  allowUnknownSlices?: boolean;
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
 *   declares a table already in `state.convexTablesExisting`. **blocker**
 *   (between two new candidates → arbitrated, not reject-both).
 * - `rbac-collision` — 2 candidates declare same RBAC permission.
 *   **warning** — operator can decide if sharing is OK.
 * - `missing-dep` — slice declares `requires.deps[X]` but X is neither
 *   in the candidate set nor in `state.slicesInstalled`. **blocker**.
 *   ALSO emitted for desired slugs whose contract is unknown **only in
 *   strict mode** (`state.allowUnknownSlices === false`).
 * - `env-missing` — `requires.env[]` ⊄ `state.envExisting`. **warning**.
 * - `explicit-conflict` — slice's `conflicts: ["<other>:<key>.<value>"]`
 *   matched `<other>`'s `provides.<key>` when both are in the candidate
 *   set. **blocker** (arbitrated, not reject-both).
 * - `uncontracted` — desired slug had no registered contract while
 *   `state.allowUnknownSlices` was true. **warning** — the slice is
 *   accepted but its surface is not inspected.
 * - `both-installed-conflict` — an explicit-conflict / table-collision
 *   surfaced between two slices BOTH already in `state.slicesInstalled`.
 *   **warning** — neither is dropped, operator is told to clean up.
 */
export type ConflictType =
  | "auth-mismatch"
  | "table-collision"
  | "rbac-collision"
  | "missing-dep"
  | "env-missing"
  | "explicit-conflict"
  | "uncontracted"
  | "both-installed-conflict";

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

/**
 * A single arbitration decision — when two candidates collide the solver
 * ranks them by "most dependers wins" and drops the loser.
 */
export interface Arbitration {
  /** The conflict that triggered the arbitration. */
  conflict: Conflict;
  /** Slug that survived. */
  winner: string;
  /** Slug that was dropped. */
  loser: string;
  /** Why this side won (dep-count + tie-break note). */
  reason: string;
}

/** Output bundle from {@link compose}. */
export interface ComposeResult {
  /** Slugs the solver would install (in BFS-discovery order). */
  accepted: string[];
  /** Slugs the solver rejected, with the reasons attached. */
  rejected: { slug: string; reasons: Conflict[]; note?: string }[];
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
  /**
   * Conflict arbitration outcomes — populated when two new candidates collide
   * and the solver picks a winner via dep-count ranking. Omitted when no such
   * arbitration was needed.
   */
  arbitrations?: Arbitration[];
  /**
   * Per-slice notes (e.g. "uncontracted", "both-installed-conflict") attached
   * to the corresponding `accepted` slug. Keyed by slug.
   */
  notes?: Record<string, string>;
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
 * Algorithm: BFS resolve transitive deps (visited-set; throws on cycle with
 * the full path in the message), then run conflict checks against state +
 * sibling candidates. When a `table-collision` or `explicit-conflict` between
 * two candidates is detected, the solver ranks them by dependers-count and
 * drops the loser only (records an `Arbitration` entry). Slugs already in
 * `state.slicesInstalled` win against new candidates; if BOTH sides of a
 * conflict are installed, neither is dropped — instead a `both-installed-
 * conflict` warning is surfaced.
 *
 * Un-contracted slugs in `desired` are accepted with an `uncontracted`
 * warning when `state.allowUnknownSlices` is true (the default). Set it to
 * false (or pass `--strict` from the CLI) to escalate them to blocker
 * `missing-dep`.
 *
 * @throws Error when a dep cycle is detected — message includes the full
 *   cycle path, e.g. `"dependency cycle detected: a → b → c → a"`.
 */
export function compose(
  req: ComposeRequest,
  contracts: Map<string, SliceContract>,
): ComposeResult;
