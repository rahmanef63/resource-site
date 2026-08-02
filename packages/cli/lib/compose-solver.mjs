// compose-solver.mjs — Phase B of the Slice Composition Compiler.
//
// Given a target project's rr.json state plus a list of desired slice slugs,
// computes a compatible subset (or rejects with detailed conflicts).
//
// v2 highlights (Track I of Wave N+1):
//   - rank-by-dependers conflict arbitration (was: reject-both).
//   - uncontracted slugs accepted with warning by default; --strict escalates.
//   - cycle detection prints the real path (no depth-cap heuristic).
//   - new ConflictTypes: `uncontracted`, `both-installed-conflict`.
//
// Public API + types live in compose-solver.d.ts.
//
// Runtime contract:
//   - `loadAllContracts(repoRoot)` (re-exported from compose-solver-loader)
//     is the only I/O entry point.
//   - `compose(req, contracts)` is pure — no fs, no env access, no mutation
//     of inputs. Always returns a fresh result object.
//
// Module split (kept ≤200 LOC each):
//   - compose-solver-loader.mjs      — contract discovery + tsx-eval
//   - compose-solver-resolve.mjs     — desired-set + BFS dep resolution
//   - compose-solver-conflicts.mjs   — surface checks + pair arbitration

import {
  buildInitialCandidates,
  resolveDependencies,
  reportUnresolvedDeps,
  computeDependersCount,
} from "./compose-solver-resolve.mjs";
import {
  runSurfaceChecks,
  buildProvidesLookup,
  makeArbitrator,
  detectPairwiseCollisions,
  detectExplicitConflicts,
} from "./compose-solver-conflicts.mjs";

export { loadAllContracts } from "./compose-solver-loader.mjs";

// ---------------------------------------------------------------------------
// Public — compose
// ---------------------------------------------------------------------------

/**
 * Pure solver. See compose-solver.d.ts for the full type contract.
 *
 * @param {import("./compose-solver").ComposeRequest} req
 * @param {Map<string, import("./contract").SliceContract>} contracts
 * @returns {import("./compose-solver").ComposeResult}
 */
export function compose(req, contracts) {
  const state = req?.state ?? {};
  const desired = Array.isArray(req?.desired) ? [...req.desired] : [];
  const resolveDeps = req?.resolveDeps !== false; // default true
  const allowUnknownSlices = state.allowUnknownSlices !== false; // default true

  const installed = new Set(state.slicesInstalled ?? []);
  const envExisting = new Set(state.envExisting ?? []);
  const rbacExisting = new Set(state.rbacRolesExisting ?? []);
  const tablesExisting = new Set(state.convexTablesExisting ?? []);

  /** @type {string[]} */
  const proof = [];
  /** @type {import("./compose-solver").Conflict[]} */
  const allConflicts = [];
  /** @type {Map<string, import("./compose-solver").Conflict[]>} */
  const blockersBySlug = new Map();
  /** @type {import("./compose-solver").Arbitration[]} */
  const arbitrations = [];
  /** @type {Map<string, string>} */
  const notes = new Map();
  /** @type {Set<string>} */
  const uncontractedDesired = new Set();
  /** @type {Set<string>} */
  const userTyped = new Set(desired);

  // Helper: record a conflict and (if blocker) attribute it to a slug.
  function record(conflict, attributeTo = conflict.slug) {
    allConflicts.push(conflict);
    if (conflict.severity === "blocker") {
      const cur = blockersBySlug.get(attributeTo) ?? [];
      cur.push(conflict);
      blockersBySlug.set(attributeTo, cur);
    }
  }

  // ── Step 1: validate desired entries, then BFS-resolve transitive deps. ──
  const { candidateOrder, candidateSet } = buildInitialCandidates({
    desired, contracts, allowUnknownSlices, record, proof, notes, uncontractedDesired,
  });

  if (resolveDeps) {
    resolveDependencies({ candidateOrder, candidateSet, contracts, installed, record, proof });
  } else {
    reportUnresolvedDeps({ candidateOrder, candidateSet, contracts, installed, record });
  }

  const dependersCount = computeDependersCount(candidateOrder, contracts);

  // ── Step 2: conflict checks. ────────────────────────────────────────────
  runSurfaceChecks({
    candidateOrder, uncontractedDesired, contracts, state, tablesExisting, envExisting, record,
  });

  const lookup = buildProvidesLookup(candidateOrder, uncontractedDesired, contracts);
  const arbitratePair = makeArbitrator({
    installed, dependersCount, allConflicts, arbitrations, notes, proof, record,
  });
  detectPairwiseCollisions({ candidateOrder, lookup, arbitratePair, allConflicts });
  detectExplicitConflicts({
    candidateOrder, candidateSet, uncontractedDesired, contracts, arbitratePair,
  });

  // ── Step 3: decide accepted / rejected. ─────────────────────────────────
  /** @type {Set<string>} */
  const finalRejected = new Set();
  for (const [slug, blocks] of blockersBySlug) {
    if (installed.has(slug)) continue;
    if (blocks.length > 0) finalRejected.add(slug);
  }

  // ── Step 4: assemble result. ────────────────────────────────────────────
  /** @type {string[]} */
  const accepted = [];
  /** @type {{ slug: string; reasons: import("./compose-solver").Conflict[]; note?: string }[]} */
  const rejected = [];
  /** @type {{ slug: string; tables: string[] }[]} */
  const tablesAdded = [];
  const envMissingSet = new Set();
  const rbacToCreateSet = new Set();

  for (const slug of candidateOrder) {
    const contract = contracts.get(slug);
    if (!contract) {
      if (uncontractedDesired.has(slug)) {
        accepted.push(slug);
        proof.push(`+ ${slug}: accepted (uncontracted, no contract surface checked)`);
      } else {
        rejected.push({ slug, reasons: blockersBySlug.get(slug) ?? [] });
      }
      continue;
    }
    if (finalRejected.has(slug)) {
      rejected.push({ slug, reasons: blockersBySlug.get(slug) ?? [] });
      const reasons = (blockersBySlug.get(slug) ?? []).map((r) => r.type).join(", ");
      proof.push(`- ${slug}: rejected (${reasons})`);
      continue;
    }
    accepted.push(slug);
    const tables = contract.provides?.tables ?? [];
    if (tables.length > 0) tablesAdded.push({ slug, tables: [...tables] });
    for (const e of contract.requires?.env ?? []) {
      if (!envExisting.has(e)) envMissingSet.add(e);
    }
    for (const p of contract.requires?.rbac ?? []) {
      if (!rbacExisting.has(p)) rbacToCreateSet.add(p);
    }

    const detail = [];
    if (contract.requires?.auth) detail.push(`auth=${contract.requires.auth}`);
    if (tables.length > 0) detail.push(`tables=${tables.join("+")}`);
    if (userTyped.has(slug)) detail.push("user-requested");
    else detail.push("transitive dep");
    proof.push(`+ ${slug}: accepted (${detail.join(", ")})`);
  }

  // Re-handle desired slugs whose contract is missing AND strict-rejected.
  for (const slug of desired) {
    if (contracts.has(slug)) continue;
    if (uncontractedDesired.has(slug)) continue;
    if (rejected.some((r) => r.slug === slug)) continue;
    if (accepted.includes(slug)) continue;
    rejected.push({ slug, reasons: blockersBySlug.get(slug) ?? [] });
  }

  const notesObj = notes.size > 0 ? Object.fromEntries(notes) : undefined;
  return {
    accepted,
    rejected,
    conflicts: allConflicts,
    envMissing: [...envMissingSet],
    rbacToCreate: [...rbacToCreateSet],
    tablesAdded,
    proof,
    ...(arbitrations.length > 0 ? { arbitrations } : {}),
    ...(notesObj ? { notes: notesObj } : {}),
  };
}
