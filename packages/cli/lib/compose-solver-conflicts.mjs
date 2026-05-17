// compose-solver-conflicts.mjs — auth/table/env/rbac/explicit conflict checks.
//
// Extracted from compose-solver.mjs. Pair-arbitration helper lives in
// compose-solver-arbitrate.mjs; re-exported here so callers keep one
// conflicts entry point.

export { makeArbitrator } from "./compose-solver-arbitrate.mjs";

/**
 * Per-candidate surface checks: auth mismatch, table collision (against
 * existing schema), env missing, rbac (implicit via lookup table).
 */
export function runSurfaceChecks({
  candidateOrder,
  uncontractedDesired,
  contracts,
  state,
  tablesExisting,
  envExisting,
  record,
}) {
  for (const slug of candidateOrder) {
    if (uncontractedDesired.has(slug)) continue;
    const contract = contracts.get(slug);
    if (!contract) continue;

    const wantAuth = contract.requires?.auth;
    if (wantAuth && state.auth && wantAuth !== state.auth && wantAuth !== "none") {
      record(
        {
          type: "auth-mismatch",
          slug,
          detail: `Slice requires auth="${wantAuth}" but target rr.json has auth="${state.auth}".`,
          severity: "blocker",
        },
        slug,
      );
    }

    const provTables = contract.provides?.tables ?? [];
    for (const t of provTables) {
      if (tablesExisting.has(t)) {
        record(
          {
            type: "table-collision",
            slug,
            detail: `Table "${t}" already exists in target Convex schema.`,
            severity: "blocker",
          },
          slug,
        );
      }
    }

    const reqEnv = contract.requires?.env ?? [];
    for (const e of reqEnv) {
      if (!envExisting.has(e)) {
        record(
          {
            type: "env-missing",
            slug,
            detail: `Env var "${e}" required by ${slug} not present in target.`,
            severity: "warning",
          },
          slug,
        );
      }
    }
  }
}

/** Build provides-lookup once: Map<slug, { tables: Set, rbac: Set }>. */
export function buildProvidesLookup(candidateOrder, uncontractedDesired, contracts) {
  /** @type {Map<string, { tables: Set<string>; rbac: Set<string> }>} */
  const lookup = new Map();
  for (const slug of candidateOrder) {
    if (uncontractedDesired.has(slug)) continue;
    const c = contracts.get(slug);
    if (!c) continue;
    lookup.set(slug, {
      tables: new Set(c.provides?.tables ?? []),
      rbac: new Set(c.requires?.rbac ?? []),
    });
  }
  return lookup;
}

/**
 * Pairwise scan: detect table collisions (arbitrated) + rbac overlaps
 * (warning only) across all candidate pairs.
 */
export function detectPairwiseCollisions({
  candidateOrder,
  lookup,
  arbitratePair,
  allConflicts,
}) {
  for (let i = 0; i < candidateOrder.length; i++) {
    for (let j = i + 1; j < candidateOrder.length; j++) {
      const a = candidateOrder[i];
      const b = candidateOrder[j];
      const la = lookup.get(a);
      const lb = lookup.get(b);
      if (!la || !lb) continue;

      const tableHits = [];
      for (const t of la.tables) if (lb.tables.has(t)) tableHits.push(t);
      if (tableHits.length > 0) {
        const detail = `Slices "${a}" and "${b}" both declare table${tableHits.length > 1 ? "s" : ""} ${tableHits.map((t) => `"${t}"`).join(", ")}.`;
        arbitratePair(a, b, "table-collision", detail, detail);
      }
      for (const p of la.rbac) {
        if (lb.rbac.has(p)) {
          allConflicts.push({
            type: "rbac-collision",
            slug: a,
            withSlug: b,
            detail: `Slices "${a}" and "${b}" both declare RBAC permission "${p}".`,
            severity: "warning",
          });
        }
      }
    }
  }
}

/**
 * Explicit `conflicts: ["<other>:<key>.<value>"]` declarations — when the
 * other slice's `provides[key]` contains `value`, surface as arbitrated
 * conflict.
 */
export function detectExplicitConflicts({
  candidateOrder,
  candidateSet,
  uncontractedDesired,
  contracts,
  arbitratePair,
}) {
  for (const slug of candidateOrder) {
    if (uncontractedDesired.has(slug)) continue;
    const c = contracts.get(slug);
    if (!c) continue;
    const conflicts = c.conflicts ?? [];
    for (const cf of conflicts) {
      const colon = cf.indexOf(":");
      const dot = cf.indexOf(".", colon);
      if (colon < 0 || dot < 0) continue;
      const otherSlug = cf.slice(0, colon);
      const key = cf.slice(colon + 1, dot);
      const value = cf.slice(dot + 1);
      if (!candidateSet.has(otherSlug)) continue;
      if (uncontractedDesired.has(otherSlug)) continue;
      const other = contracts.get(otherSlug);
      if (!other) continue;
      const provided = other.provides?.[key];
      if (Array.isArray(provided) && provided.includes(value)) {
        const detailA = `Slice "${slug}" declares explicit conflict with "${otherSlug}" on ${key}.${value}.`;
        const detailB = `Slice "${otherSlug}" is the target of "${slug}"'s explicit conflict on ${key}.${value}.`;
        arbitratePair(slug, otherSlug, "explicit-conflict", detailA, detailB);
      }
    }
  }
}
