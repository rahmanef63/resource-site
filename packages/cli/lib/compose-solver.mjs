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

  // First, fold in each desired slug. Unknown contracts are blocker-rejected
  // (strict mode) or warning-accepted (default, `allowUnknownSlices: true`).
  for (const slug of desired) {
    if (candidateSet.has(slug)) continue;
    const contract = contracts.get(slug);
    if (!contract) {
      if (allowUnknownSlices) {
        record(
          {
            type: "uncontracted",
            slug,
            detail: `Slice "${slug}" has no registered slice.contract.ts — accepted under allowUnknownSlices, but conflict checks are skipped for it.`,
            severity: "warning",
          },
          slug,
        );
        uncontractedDesired.add(slug);
        candidateSet.add(slug);
        candidateOrder.push(slug);
        notes.set(slug, "uncontracted");
        proof.push(`! ${slug}: accepted as uncontracted (no slice.contract.ts; skipping conflict checks)`);
      } else {
        record(
          {
            type: "missing-dep",
            slug,
            detail: `Contract not found for "${slug}" — no slice.contract.ts registered (strict mode).`,
            severity: "blocker",
          },
          slug,
        );
        proof.push(`- ${slug}: rejected (no contract found, strict mode)`);
      }
      continue;
    }
    candidateSet.add(slug);
    candidateOrder.push(slug);
  }

  if (resolveDeps) {
    // BFS over requires.deps[]. We use a proper visited-path map per starting
    // root so we can print the full cycle when one is encountered.
    /** @type {Array<{ slug: string; chain: string[] }>} */
    const queue = candidateOrder
      .filter((s) => contracts.has(s))
      .map((slug) => ({ slug, chain: [slug] }));
    while (queue.length > 0) {
      const { slug, chain } = queue.shift();
      const contract = contracts.get(slug);
      const deps = contract?.requires?.deps ?? [];
      for (const dep of deps) {
        if (chain.includes(dep)) {
          const cyclePath = [...chain.slice(chain.indexOf(dep)), dep].join(" → ");
          throw new Error(`dependency cycle detected: ${cyclePath}`);
        }
        if (installed.has(dep)) {
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
        queue.push({ slug: dep, chain: [...chain, dep] });
      }
    }
  } else {
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

  // Build a dependers-count map: for each candidate, count how many OTHER
  // candidates list it in their `requires.deps[]`. Used for arbitration
  // ranking in Step 2.
  /** @type {Map<string, number>} */
  const dependersCount = new Map();
  for (const slug of candidateOrder) dependersCount.set(slug, 0);
  for (const slug of candidateOrder) {
    const c = contracts.get(slug);
    if (!c) continue;
    for (const d of c.requires?.deps ?? []) {
      if (dependersCount.has(d)) {
        dependersCount.set(d, (dependersCount.get(d) ?? 0) + 1);
      }
    }
  }

  // ── Step 2: conflict checks. ────────────────────────────────────────────
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

  // Build provides lookup once.
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

  /**
   * Pair-conflict arbitration helper.
   *
   * @param {string} a
   * @param {string} b
   * @param {import("./compose-solver").ConflictType} type
   * @param {string} detailA
   * @param {string} detailB
   */
  function arbitratePair(a, b, type, detailA, detailB) {
    const ca = /** @type {import("./compose-solver").Conflict} */ ({
      type, slug: a, withSlug: b, detail: detailA, severity: "blocker",
    });
    const cb = /** @type {import("./compose-solver").Conflict} */ ({
      type, slug: b, withSlug: a, detail: detailB, severity: "blocker",
    });
    const bothInstalled = installed.has(a) && installed.has(b);
    if (bothInstalled) {
      allConflicts.push({ ...ca, severity: "warning", type: "both-installed-conflict" });
      allConflicts.push({ ...cb, severity: "warning", type: "both-installed-conflict" });
      notes.set(a, notes.get(a) ?? "both-installed-conflict");
      notes.set(b, notes.get(b) ?? "both-installed-conflict");
      proof.push(`! ${a} ↔ ${b}: both already installed — conflict surfaced as warning, neither dropped`);
      return;
    }
    if (installed.has(a) && !installed.has(b)) {
      record(cb, b);
      arbitrations.push({
        conflict: cb, winner: a, loser: b,
        reason: `"${a}" already installed — installed slice wins`,
      });
      proof.push(`- ${b}: arbitrated against ${a} (installed wins)`);
      return;
    }
    if (installed.has(b) && !installed.has(a)) {
      record(ca, a);
      arbitrations.push({
        conflict: ca, winner: b, loser: a,
        reason: `"${b}" already installed — installed slice wins`,
      });
      proof.push(`- ${a}: arbitrated against ${b} (installed wins)`);
      return;
    }
    const depA = dependersCount.get(a) ?? 0;
    const depB = dependersCount.get(b) ?? 0;
    let winner, loser, conflictForLoser, reason;
    if (depA !== depB) {
      if (depA > depB) {
        winner = a; loser = b; conflictForLoser = cb;
        reason = `"${a}" has ${depA} dependers vs "${b}" with ${depB} — most-dependers wins`;
      } else {
        winner = b; loser = a; conflictForLoser = ca;
        reason = `"${b}" has ${depB} dependers vs "${a}" with ${depA} — most-dependers wins`;
      }
    } else {
      const later = a > b ? a : b;
      const earlier = a > b ? b : a;
      winner = earlier;
      loser = later;
      conflictForLoser = later === a ? ca : cb;
      reason = `tie at ${depA} dependers — alphabetical tiebreak drops "${later}"`;
    }
    record(conflictForLoser, loser);
    arbitrations.push({ conflict: conflictForLoser, winner, loser, reason });
    proof.push(`- ${loser}: arbitrated against ${winner} (${reason})`);
  }

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

  // 2e. explicit-conflict — slice declares conflicts: ["<other>:<key>.<value>"].
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
