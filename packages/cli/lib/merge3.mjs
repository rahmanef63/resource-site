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
// Types live in merge3.d.ts. Module split (kept ≤200 LOC each):
//   - merge3-diff.mjs      — per-element diff functions + SET_KEYS table
//   - merge3-snapshot.mjs  — buildMergedSnapshot + applyMerge

import { diffFile, diffSetMember, toSet, SET_KEYS } from "./merge3-diff.mjs";
import { buildMergedSnapshot } from "./merge3-snapshot.mjs";

export { applyMerge } from "./merge3-snapshot.mjs";

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
