// merge3.mjs — Slice Composition Compiler Phase D.
//
// 3-way semantic merge engine. Operates on `SliceSnapshot` trios (base / kitab
// / consumer) and produces a structured `MergeReport`. Unlike a raw text
// merge, the unit of conflict resolution is a slice element:
//   - a single file (path → content)
//   - a single contract surface entry (env var, RBAC permission, route, …)
//
// Algorithm overview, per element:
//   base === kitab === consumer                 → identical
//   kitab changed, consumer unchanged           → auto-merged (apply kitab)
//   kitab unchanged, consumer changed           → consumer-wins-clean
//   both changed (and differ from each other)   → conflict
//
// Files / contract sets use the same three-way logic, with kind-specific
// hints for the conflict messages so a human reviewer can act.
//
// Types live in merge3.d.ts. The module is dependency-free node:fs plus
// node:path — no third-party libs.

import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * @param {import("./merge3").MergeRequest} req
 * @returns {import("./merge3").MergeReport}
 */
export function merge3(req) {
  if (!req || typeof req !== "object") {
    throw new Error("merge3: request object required");
  }
  const { base, kitab, consumer } = req;
  for (const [name, snap] of [
    ["base", base],
    ["kitab", kitab],
    ["consumer", consumer],
  ]) {
    if (!snap || typeof snap !== "object") {
      throw new Error(`merge3: ${name} snapshot required`);
    }
    if (typeof snap.slug !== "string" || !snap.slug) {
      throw new Error(`merge3: ${name}.slug required`);
    }
    if (!snap.files || typeof snap.files !== "object") {
      throw new Error(`merge3: ${name}.files must be an object`);
    }
  }
  if (base.slug !== kitab.slug || kitab.slug !== consumer.slug) {
    throw new Error(
      `merge3: slug mismatch — base="${base.slug}" kitab="${kitab.slug}" consumer="${consumer.slug}"`,
    );
  }

  const outcomes = [];

  // ── Files ──────────────────────────────────────────────────────────────
  const allPaths = new Set([
    ...Object.keys(base.files),
    ...Object.keys(kitab.files),
    ...Object.keys(consumer.files),
  ]);
  const sortedPaths = [...allPaths].sort();
  for (const p of sortedPaths) {
    outcomes.push(diffFile(p, base.files[p], kitab.files[p], consumer.files[p]));
  }

  // ── Contract surfaces ──────────────────────────────────────────────────
  // Each is a set of strings that we three-way-merge with set semantics.
  const SET_KEYS = [
    ["contract.requires.env", (c) => c?.requires?.env],
    ["contract.requires.rbac", (c) => c?.requires?.rbac],
    ["contract.requires.deps", (c) => c?.requires?.deps],
    ["contract.provides.tables", (c) => c?.provides?.tables],
    ["contract.provides.routes", (c) => c?.provides?.routes],
    ["contract.provides.hooks", (c) => c?.provides?.hooks],
    ["contract.provides.components", (c) => c?.provides?.components],
    ["contract.provides.events", (c) => c?.provides?.events],
  ];

  for (const [keyPath, accessor] of SET_KEYS) {
    const bSet = toSet(accessor(base.contract));
    const kSet = toSet(accessor(kitab.contract));
    const cSet = toSet(accessor(consumer.contract));
    const members = new Set([...bSet, ...kSet, ...cSet]);
    for (const member of [...members].sort()) {
      outcomes.push(
        diffSetMember(`${keyPath}:${member}`, member, bSet.has(member), kSet.has(member), cSet.has(member)),
      );
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────
  const summary = {
    autoMerged: 0,
    kitabWinsClean: 0,
    consumerWinsClean: 0,
    conflicts: 0,
    identical: 0,
  };
  for (const o of outcomes) {
    switch (o.kind) {
      case "auto-merged":
        summary.autoMerged++;
        break;
      case "kitab-wins-clean":
        summary.kitabWinsClean++;
        break;
      case "consumer-wins-clean":
        summary.consumerWinsClean++;
        break;
      case "conflict":
        summary.conflicts++;
        break;
      case "identical":
        summary.identical++;
        break;
    }
  }

  const total = outcomes.length || 1;
  const driftAfterMerge = Math.round(
    (100 * (summary.conflicts + summary.consumerWinsClean)) / total,
  );

  /** @type {import("./merge3").MergeReport} */
  const report = {
    slug: kitab.slug,
    outcomes,
    summary,
    driftAfterMerge,
  };

  if (summary.conflicts === 0) {
    report.mergedSnapshot = buildMergedSnapshot(req, outcomes);
  }

  return report;
}

/**
 * Write merged files to a target directory. Throws if the report contains
 * any conflicts (no clean snapshot to apply).
 *
 * @param {import("./merge3").MergeReport} report
 * @param {string} targetDir
 */
export async function applyMerge(report, targetDir) {
  if (!report || typeof report !== "object") {
    throw new Error("applyMerge: report required");
  }
  if (report.summary.conflicts > 0) {
    throw new Error(
      `applyMerge: refusing to apply — ${report.summary.conflicts} conflict(s) remain in slice "${report.slug}". Resolve them first or pass --force.`,
    );
  }
  if (!report.mergedSnapshot) {
    throw new Error("applyMerge: report has no mergedSnapshot (was the merge clean?)");
  }
  if (!targetDir || typeof targetDir !== "string") {
    throw new Error("applyMerge: targetDir required");
  }

  const merged = report.mergedSnapshot.files;
  // First write/overwrite all merged paths.
  for (const [rel, content] of Object.entries(merged)) {
    const dest = path.join(targetDir, rel);
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, content);
  }
  // Then delete files that were dropped in the merged snapshot. We infer
  // "dropped" from file outcomes whose mergedValue is null but baseValue or
  // consumerValue existed.
  for (const o of report.outcomes) {
    if (!o.element.startsWith("files/")) continue;
    if (o.mergedValue === null && (o.baseValue != null || o.consumerValue != null)) {
      const rel = o.element.slice("files/".length);
      const dest = path.join(targetDir, rel);
      if (existsSync(dest)) rmSync(dest, { force: true });
    }
  }
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function diffFile(pathRel, baseVal, kitabVal, consumerVal) {
  const bExists = baseVal !== undefined;
  const kExists = kitabVal !== undefined;
  const cExists = consumerVal !== undefined;

  // Normalize to null when absent for the report payload, since `undefined`
  // round-trips poorly through JSON.
  const out = {
    element: `files/${pathRel}`,
    kind: "identical",
    baseValue: bExists ? baseVal : null,
    kitabValue: kExists ? kitabVal : null,
    consumerValue: cExists ? consumerVal : null,
  };

  if (!bExists && !kExists && !cExists) {
    // unreachable in practice, but keeps the function total
    out.mergedValue = null;
    return out;
  }

  // Case: only kitab has it → kitab added (consumer never saw it).
  if (!bExists && kExists && !cExists) {
    out.kind = "auto-merged";
    out.mergedValue = kitabVal;
    return out;
  }
  // Case: only consumer has it → consumer added locally.
  if (!bExists && !kExists && cExists) {
    out.kind = "consumer-wins-clean";
    out.mergedValue = consumerVal;
    return out;
  }
  // Case: kitab and consumer both added it (no base). Identical adds → ok,
  // differing adds → conflict.
  if (!bExists && kExists && cExists) {
    if (kitabVal === consumerVal) {
      out.kind = "identical";
      out.mergedValue = kitabVal;
      return out;
    }
    out.kind = "conflict";
    out.conflictHint = `both kitab and consumer added "${pathRel}" with different contents`;
    return out;
  }
  // Case: kitab removed (base had it, kitab doesn't).
  if (bExists && !kExists) {
    if (!cExists) {
      // both sides removed → identical removal
      out.kind = "identical";
      out.mergedValue = null;
      return out;
    }
    if (consumerVal === baseVal) {
      // consumer untouched, kitab dropped → apply removal
      out.kind = "auto-merged";
      out.mergedValue = null;
      return out;
    }
    // kitab removed, consumer modified → conflict
    out.kind = "conflict";
    out.conflictHint = `kitab removed "${pathRel}"; consumer modified it — keep or drop?`;
    return out;
  }
  // Case: consumer removed (base had it, kitab still does, consumer dropped).
  if (bExists && kExists && !cExists) {
    if (kitabVal === baseVal) {
      // consumer-only deletion — respect it
      out.kind = "consumer-wins-clean";
      out.mergedValue = null;
      return out;
    }
    // consumer removed, kitab modified → conflict
    out.kind = "conflict";
    out.conflictHint = `consumer removed "${pathRel}"; kitab modified it — re-add or drop?`;
    return out;
  }
  // Case: all three exist. Classic 3-way diff.
  if (baseVal === kitabVal && baseVal === consumerVal) {
    out.kind = "identical";
    out.mergedValue = baseVal;
    return out;
  }
  if (baseVal !== kitabVal && baseVal === consumerVal) {
    out.kind = "auto-merged";
    out.mergedValue = kitabVal;
    return out;
  }
  if (baseVal === kitabVal && baseVal !== consumerVal) {
    out.kind = "consumer-wins-clean";
    out.mergedValue = consumerVal;
    return out;
  }
  // Both differ from base — coincidentally equal? then identical-merge.
  if (kitabVal === consumerVal) {
    out.kind = "identical";
    out.mergedValue = kitabVal;
    return out;
  }
  out.kind = "conflict";
  out.conflictHint = `both kitab and consumer modified "${pathRel}"; review needed`;
  return out;
}

function diffSetMember(elementKey, member, inBase, inKitab, inConsumer) {
  const out = {
    element: elementKey,
    kind: "identical",
    baseValue: inBase ? member : null,
    kitabValue: inKitab ? member : null,
    consumerValue: inConsumer ? member : null,
  };

  // Already present everywhere it should be → identical
  if (inBase && inKitab && inConsumer) {
    out.kind = "identical";
    out.mergedValue = member;
    return out;
  }
  if (!inBase && !inKitab && !inConsumer) {
    // unreachable
    out.mergedValue = null;
    return out;
  }

  // Added in kitab only, consumer hasn't seen it
  if (!inBase && inKitab && !inConsumer) {
    out.kind = "auto-merged";
    out.mergedValue = member;
    return out;
  }
  // Added in consumer only
  if (!inBase && !inKitab && inConsumer) {
    out.kind = "consumer-wins-clean";
    out.mergedValue = member;
    return out;
  }
  // Added in both kitab and consumer independently (same value) — identical
  if (!inBase && inKitab && inConsumer) {
    out.kind = "identical";
    out.mergedValue = member;
    return out;
  }
  // Removed in kitab, kept in consumer → conflict (consumer still relies on it)
  if (inBase && !inKitab && inConsumer) {
    out.kind = "conflict";
    out.conflictHint = `kitab dropped "${member}" (${elementKey.split(":")[0]}); consumer still relies on it`;
    return out;
  }
  // Removed in consumer, kept in kitab → consumer-wins-clean (consumer removed for its own reasons)
  if (inBase && inKitab && !inConsumer) {
    out.kind = "consumer-wins-clean";
    out.mergedValue = null;
    return out;
  }
  // Removed in both (only in base) → identical removal
  if (inBase && !inKitab && !inConsumer) {
    out.kind = "identical";
    out.mergedValue = null;
    return out;
  }

  // Fallback (shouldn't reach)
  out.kind = "conflict";
  out.conflictHint = `unexpected set-membership pattern for "${member}"`;
  return out;
}

function toSet(arr) {
  if (!Array.isArray(arr)) return new Set();
  return new Set(arr.filter((x) => typeof x === "string"));
}

/**
 * Produce a merged SliceSnapshot from the outcomes. Only called when there
 * are zero conflicts.
 */
function buildMergedSnapshot(req, outcomes) {
  const { kitab, consumer } = req;
  /** @type {Record<string, string>} */
  const files = {};
  for (const o of outcomes) {
    if (!o.element.startsWith("files/")) continue;
    if (o.mergedValue == null) continue; // file removed in merge
    const rel = o.element.slice("files/".length);
    files[rel] = /** @type {string} */ (o.mergedValue);
  }

  // Rebuild contract by applying merged set memberships back into the
  // kitab-side contract shape (so requires.convex.prefix etc. propagate).
  let mergedContract;
  if (kitab.contract || consumer.contract) {
    const baseContract = kitab.contract ?? consumer.contract;
    mergedContract = JSON.parse(JSON.stringify(baseContract));
    mergedContract.requires = mergedContract.requires ?? {};
    mergedContract.provides = mergedContract.provides ?? {};
    const SET_PATHS = {
      "contract.requires.env": ["requires", "env"],
      "contract.requires.rbac": ["requires", "rbac"],
      "contract.requires.deps": ["requires", "deps"],
      "contract.provides.tables": ["provides", "tables"],
      "contract.provides.routes": ["provides", "routes"],
      "contract.provides.hooks": ["provides", "hooks"],
      "contract.provides.components": ["provides", "components"],
      "contract.provides.events": ["provides", "events"],
    };
    /** @type {Record<string, Set<string>>} */
    const merged = {};
    for (const o of outcomes) {
      const colon = o.element.indexOf(":");
      if (colon < 0) continue;
      const key = o.element.slice(0, colon);
      if (!Object.prototype.hasOwnProperty.call(SET_PATHS, key)) continue;
      const member = o.element.slice(colon + 1);
      if (!merged[key]) merged[key] = new Set();
      if (o.mergedValue != null && o.kind !== "conflict") {
        merged[key].add(member);
      }
    }
    for (const [keyPath, [a, b]] of Object.entries(SET_PATHS)) {
      const set = merged[keyPath];
      if (!set) continue;
      const arr = [...set].sort();
      if (arr.length === 0) {
        if (mergedContract[a]) delete mergedContract[a][b];
      } else {
        mergedContract[a] = mergedContract[a] ?? {};
        mergedContract[a][b] = arr;
      }
    }
  }

  /** @type {import("./merge3").SliceSnapshot} */
  const snap = {
    slug: kitab.slug,
    version: kitab.version || consumer.version,
    files,
  };
  if (mergedContract) snap.contract = mergedContract;
  return snap;
}
