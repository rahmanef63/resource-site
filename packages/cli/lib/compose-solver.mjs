// compose-solver.mjs — Phase B of the Slice Composition Compiler.
//
// Given a target project's rr.json state plus a list of desired slice slugs,
// computes a compatible subset (or rejects with detailed conflicts). The
// solver is intentionally greedy + conflict-driven (not full CSP) — when a
// blocker pair is hit, both sides are rejected unless one is already
// installed (then the installed slice wins).
//
// Public API + types live in compose-solver.d.ts.
//
// Runtime contract:
//   - `loadAllContracts(repoRoot)` is the only I/O entry point. It mirrors
//     scripts/validation/validate-contract.mjs's tsx-eval strategy.
//   - `compose(req, contracts)` is pure — no fs, no env access, no mutation
//     of inputs. Always returns a fresh result object.

import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

// ---------------------------------------------------------------------------
// Public — loadAllContracts
// ---------------------------------------------------------------------------

const SLICE_ROOT_GLOBS = [
  ["frontend", "slices"],
  ["template-base", "frontend", "slices"],
];

/**
 * Discover every `slice.contract.ts` under the kitab's known slice roots and
 * load them via `npx tsx`. Returns a Map<slug, SliceContract>. Contracts that
 * fail to load are silently skipped so a single broken file doesn't take
 * down the whole solver — `npm run validate:contracts` is the place to surface
 * those errors.
 *
 * @param {string} repoRoot Absolute path to the kitab repo root.
 * @returns {Promise<Map<string, import("./contract").SliceContract>>}
 */
export async function loadAllContracts(repoRoot) {
  /** @type {Map<string, import("./contract").SliceContract>} */
  const out = new Map();
  const sliceFiles = await discoverContractFiles(repoRoot);
  for (const filePath of sliceFiles) {
    const contract = loadContractFile(repoRoot, filePath);
    if (contract && typeof contract.id === "string") {
      out.set(contract.id, contract);
    }
  }
  return out;
}

async function discoverContractFiles(repoRoot) {
  const found = [];
  for (const segs of SLICE_ROOT_GLOBS) {
    const root = path.join(repoRoot, ...segs);
    if (!existsSync(root)) continue;
    const entries = await readdir(root, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith("_")) continue;
      const filePath = path.join(root, entry.name, "slice.contract.ts");
      if (existsSync(filePath)) found.push(filePath);
    }
  }
  return found;
}

/**
 * Dynamic-import a .ts contract file via `npx tsx -e` and JSON.parse the
 * stringified `contract` export. Returns null on any failure.
 */
function loadContractFile(repoRoot, filePath) {
  const rel = "./" + path.relative(repoRoot, filePath);
  const code = [
    `import(${JSON.stringify(rel)})`,
    `  .then(m => { const c = m.contract || (m.default && m.default.contract); if (!c) { process.exit(2); } process.stdout.write(JSON.stringify(c)); })`,
    `  .catch(() => process.exit(3));`,
  ].join("\n");
  const res = spawnSync("npx", ["--no-install", "tsx", "-e", code], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (res.status === 0 && res.stdout) {
    try {
      return JSON.parse(res.stdout);
    } catch {
      return null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public — compose
// ---------------------------------------------------------------------------

const MAX_DEP_DEPTH = 16;

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
  /** @type {string[]} */
  const candidateOrder = [];
  const candidateSet = new Set();
  /** @type {Set<string>} */
  const userTyped = new Set(desired);

  // First, fold in each desired slug. Unknown contracts are blocker-rejected.
  for (const slug of desired) {
    if (candidateSet.has(slug)) continue;
    const contract = contracts.get(slug);
    if (!contract) {
      record(
        {
          type: "missing-dep",
          slug,
          detail: `Contract not found for "${slug}" — no slice.contract.ts registered.`,
          severity: "blocker",
        },
        slug,
      );
      proof.push(`- ${slug}: rejected (no contract found)`);
      continue;
    }
    candidateSet.add(slug);
    candidateOrder.push(slug);
  }

  if (resolveDeps) {
    // BFS over requires.deps[]. We track depth to catch cycles.
    /** @type {Array<{ slug: string; depth: number; chain: string[] }>} */
    const queue = candidateOrder.map((slug) => ({ slug, depth: 0, chain: [slug] }));
    while (queue.length > 0) {
      const { slug, depth, chain } = queue.shift();
      if (depth > MAX_DEP_DEPTH) {
        throw new Error(
          `compose: dep cycle detected (depth > ${MAX_DEP_DEPTH}) along ${chain.join(" -> ")}`,
        );
      }
      const contract = contracts.get(slug);
      const deps = contract?.requires?.deps ?? [];
      for (const dep of deps) {
        if (chain.includes(dep)) {
          throw new Error(
            `compose: dep cycle detected — ${[...chain, dep].join(" -> ")}`,
          );
        }
        if (installed.has(dep)) {
          // Already installed — no need to recurse.
          continue;
        }
        if (candidateSet.has(dep)) continue;
        const depContract = contracts.get(dep);
        if (!depContract) {
          record(
            {
              type: "missing-dep",
              slug,
              withSlug: dep,
              detail: `Slice "${slug}" requires "${dep}" but no contract is registered for it.`,
              severity: "blocker",
            },
            slug,
          );
          proof.push(`- ${slug}: missing dep "${dep}" (not in candidates, not installed)`);
          continue;
        }
        candidateSet.add(dep);
        candidateOrder.push(dep);
        proof.push(`+ ${dep}: pulled in as transitive dep of ${slug}`);
        queue.push({ slug: dep, depth: depth + 1, chain: [...chain, dep] });
      }
    }
  } else {
    // --no-deps: surface unresolved deps as blockers without recursing.
    for (const slug of candidateOrder) {
      const deps = contracts.get(slug)?.requires?.deps ?? [];
      for (const dep of deps) {
        if (installed.has(dep) || candidateSet.has(dep)) continue;
        record(
          {
            type: "missing-dep",
            slug,
            withSlug: dep,
            detail: `Slice "${slug}" requires "${dep}" (resolveDeps disabled — not auto-pulled).`,
            severity: "blocker",
          },
          slug,
        );
      }
    }
  }

  // ── Step 2: conflict checks. ────────────────────────────────────────────
  for (const slug of candidateOrder) {
    const contract = contracts.get(slug);
    if (!contract) continue; // already rejected at step 1

    // 2a. auth-mismatch vs target state.
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

    // 2b. table-collision vs target state.
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

    // 2c. env-missing vs target state — warning only.
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

  // 2d. pairwise checks across candidates.
  // Build provides lookup once.
  /** @type {Map<string, { tables: Set<string>; rbac: Set<string> }>} */
  const lookup = new Map();
  for (const slug of candidateOrder) {
    const c = contracts.get(slug);
    if (!c) continue;
    lookup.set(slug, {
      tables: new Set(c.provides?.tables ?? []),
      rbac: new Set(c.requires?.rbac ?? []),
    });
  }

  for (let i = 0; i < candidateOrder.length; i++) {
    for (let j = i + 1; j < candidateOrder.length; j++) {
      const a = candidateOrder[i];
      const b = candidateOrder[j];
      const la = lookup.get(a);
      const lb = lookup.get(b);
      if (!la || !lb) continue;

      // table-collision between two candidates.
      for (const t of la.tables) {
        if (lb.tables.has(t)) {
          // Mutual blocker — attribute to BOTH (symmetric detail string).
          const detail = `Slices "${a}" and "${b}" both declare table "${t}".`;
          record(
            {
              type: "table-collision",
              slug: a,
              withSlug: b,
              detail,
              severity: "blocker",
            },
            a,
          );
          record(
            {
              type: "table-collision",
              slug: b,
              withSlug: a,
              detail,
              severity: "blocker",
            },
            b,
          );
        }
      }
      // rbac-collision — warning only.
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

  // 2e. explicit-conflict — slice declares conflicts: ["<other>:<key>.<value>"].
  for (const slug of candidateOrder) {
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
      if (!candidateSet.has(otherSlug)) continue; // dormant — other not in compose set
      const other = contracts.get(otherSlug);
      if (!other) continue;
      const provided = other.provides?.[key];
      if (Array.isArray(provided) && provided.includes(value)) {
        const ca = {
          type: /** @type {const} */ ("explicit-conflict"),
          slug,
          withSlug: otherSlug,
          detail: `Slice "${slug}" declares explicit conflict with "${otherSlug}" on ${key}.${value}.`,
          severity: /** @type {const} */ ("blocker"),
        };
        const cb = {
          type: /** @type {const} */ ("explicit-conflict"),
          slug: otherSlug,
          withSlug: slug,
          detail: `Slice "${otherSlug}" is the target of "${slug}"'s explicit conflict on ${key}.${value}.`,
          severity: /** @type {const} */ ("blocker"),
        };
        record(ca, slug);
        record(cb, otherSlug);
      }
    }
  }

  // ── Step 3: decide accepted / rejected. ─────────────────────────────────
  // Greedy rule: a candidate with any blocker is rejected UNLESS it's already
  // in `state.slicesInstalled` — in which case the installed slice wins and
  // we strip its blockers from peers (they keep their other-side blockers).
  /** @type {Set<string>} */
  const finalRejected = new Set();
  for (const [slug, blocks] of blockersBySlug) {
    if (installed.has(slug)) {
      // Installed wins — peers attribution stays; do not reject installed.
      continue;
    }
    if (blocks.length > 0) finalRejected.add(slug);
  }

  // ── Step 4: assemble result. ────────────────────────────────────────────
  /** @type {string[]} */
  const accepted = [];
  /** @type {{ slug: string; reasons: import("./compose-solver").Conflict[] }[]} */
  const rejected = [];
  /** @type {{ slug: string; tables: string[] }[]} */
  const tablesAdded = [];
  const envMissingSet = new Set();
  const rbacToCreateSet = new Set();

  for (const slug of candidateOrder) {
    const contract = contracts.get(slug);
    if (!contract) {
      // Unknown desired slug — already produced a missing-dep blocker.
      rejected.push({ slug, reasons: blockersBySlug.get(slug) ?? [] });
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

    // Proof line: accepted with a quick recap of why it cleared the bar.
    const detail = [];
    if (contract.requires?.auth) detail.push(`auth=${contract.requires.auth}`);
    if (tables.length > 0) detail.push(`tables=${tables.join("+")}`);
    if (userTyped.has(slug)) detail.push("user-requested");
    else detail.push("transitive dep");
    proof.push(`+ ${slug}: accepted (${detail.join(", ")})`);
  }

  // Re-handle desired slugs whose contract is missing (they were never put
  // into candidateOrder, so the for-loop above didn't surface them in
  // `rejected`).
  for (const slug of desired) {
    if (contracts.has(slug)) continue;
    if (rejected.some((r) => r.slug === slug)) continue;
    rejected.push({ slug, reasons: blockersBySlug.get(slug) ?? [] });
  }

  return {
    accepted,
    rejected,
    conflicts: allConflicts,
    envMissing: [...envMissingSet],
    rbacToCreate: [...rbacToCreateSet],
    tablesAdded,
    proof,
  };
}
