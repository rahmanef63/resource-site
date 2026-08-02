// migration-plan.mjs — Phase E of the Slice Composition Compiler.
//
// Given two versions of a slice contract (or just one when synthesising a
// fresh migration), produce a structured diff + a concrete migration plan
// with risk + reversibility scoring and pre-rendered artifacts the operator
// can paste into Convex schema files, .env.example, or the project's RBAC
// config.
//
// Public API + types live in migration-plan.d.ts.
//
// Module split (kept ≤200 LOC each):
//   - migration-plan-render.mjs  — paste-ready snippet renderers + helpers
//   - migration-plan-steps.mjs   — per-diff-bucket step generators
//   - migration-plan.mjs (here)  — diffContracts + planMigration glue

import {
  addRenameSteps,
  addAddSteps,
  addRemoveSteps,
} from "./migration-plan-steps.mjs";

// ---------------------------------------------------------------------------
// Public — diffContracts
// ---------------------------------------------------------------------------

/**
 * Compute the structural diff between two versions of a slice contract.
 *
 * Rename detection runs only when `to.migrationFrom?.[from.version]` is set.
 * When the marker is present the planner tries to pair entries that exist
 * only on one side via a stable index match — same-position entries become
 * a renamed pair, the rest stay as added/removed. This conservative pairing
 * keeps the output deterministic without parsing the marker string itself.
 *
 * @param {import("./contract").SliceContract} from
 * @param {import("./contract").SliceContract} to
 * @returns {import("./migration-plan").ContractDiff}
 */
export function diffContracts(from, to) {
  if (!from || typeof from !== "object") {
    throw new Error("diffContracts: `from` contract is required");
  }
  if (!to || typeof to !== "object") {
    throw new Error("diffContracts: `to` contract is required");
  }
  if (from.id !== to.id) {
    throw new Error(
      `diffContracts: contract ids differ — "${from.id}" vs "${to.id}"`,
    );
  }

  const fromTables = unique(from.provides?.tables ?? []);
  const toTables = unique(to.provides?.tables ?? []);
  const fromRoutes = unique(from.provides?.routes ?? []);
  const toRoutes = unique(to.provides?.routes ?? []);
  const fromEnv = unique(from.requires?.env ?? []);
  const toEnv = unique(to.requires?.env ?? []);
  const fromRbac = unique(from.requires?.rbac ?? []);
  const toRbac = unique(to.requires?.rbac ?? []);

  let addedTables = diffArr(toTables, fromTables);
  let removedTables = diffArr(fromTables, toTables);
  /** @type {{ from: string; to: string }[]} */
  const renamedTables = [];

  const hasRenameMarker =
    to.migrationFrom &&
    typeof to.migrationFrom === "object" &&
    typeof to.migrationFrom[from.version] === "string";

  if (hasRenameMarker && removedTables.length > 0 && addedTables.length > 0) {
    const removedInOrder = fromTables.filter((t) => removedTables.includes(t));
    const addedInOrder = toTables.filter((t) => addedTables.includes(t));
    const pairs = Math.min(removedInOrder.length, addedInOrder.length);
    for (let i = 0; i < pairs; i++) {
      renamedTables.push({ from: removedInOrder[i], to: addedInOrder[i] });
    }
    const pairedFrom = new Set(renamedTables.map((r) => r.from));
    const pairedTo = new Set(renamedTables.map((r) => r.to));
    removedTables = removedTables.filter((t) => !pairedFrom.has(t));
    addedTables = addedTables.filter((t) => !pairedTo.has(t));
  }

  return {
    slug: from.id,
    fromVersion: from.version,
    toVersion: to.version,
    added: pruneEmpty({
      tables: addedTables,
      routes: diffArr(toRoutes, fromRoutes),
      env: diffArr(toEnv, fromEnv),
      rbac: diffArr(toRbac, fromRbac),
    }),
    removed: pruneEmpty({
      tables: removedTables,
      routes: diffArr(fromRoutes, toRoutes),
      env: diffArr(fromEnv, toEnv),
      rbac: diffArr(fromRbac, toRbac),
    }),
    renamed: pruneEmpty({ tables: renamedTables }),
  };
}

// ---------------------------------------------------------------------------
// Public — planMigration
// ---------------------------------------------------------------------------

/**
 * Turn a {@link ContractDiff} into a concrete, risk-scored migration plan.
 *
 * Step id format: `M{NNN}-{kind-suffix}-{name}` — stable + sortable so the
 * CLI can write files in execution order. NNN is zero-padded to 3 digits.
 *
 * @param {import("./migration-plan").ContractDiff} diff
 * @returns {import("./migration-plan").MigrationPlan}
 */
export function planMigration(diff) {
  if (!diff || typeof diff !== "object" || !diff.slug) {
    throw new Error("planMigration: diff with slug is required");
  }

  /** @type {import("./migration-plan").MigrationStep[]} */
  const steps = [];
  /** @type {string[]} */
  const warnings = [];
  let counter = 1;
  const nextId = (suffix) => {
    const id = `M${String(counter).padStart(3, "0")}-${suffix}`;
    counter += 1;
    return id;
  };

  // Renames first (precede plain adds), then adds, then removes.
  addRenameSteps(steps, diff, nextId);
  addAddSteps(steps, diff, nextId);
  addRemoveSteps(steps, warnings, diff, nextId);

  const highRisk = steps.filter((s) => s.risk === "high").length;
  const irreversible = steps.filter((s) => !s.reversible).length;

  return {
    slug: diff.slug,
    fromVersion: diff.fromVersion,
    toVersion: diff.toVersion,
    steps,
    summary: { totalSteps: steps.length, highRisk, irreversible },
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Internal — helpers
// ---------------------------------------------------------------------------

function diffArr(a, b) {
  const setB = new Set(b);
  return a.filter((x) => !setB.has(x));
}

function unique(a) {
  return Array.from(new Set(a));
}

function pruneEmpty(obj) {
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (Array.isArray(v) && v.length === 0) continue;
    if (v == null) continue;
    out[k] = v;
  }
  return out;
}
