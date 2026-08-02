// merge3-snapshot.mjs — merged-snapshot builder + apply helper.
//
// Extracted from merge3.mjs.

import { mkdirSync, writeFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";

import { SET_PATHS } from "./merge3-diff.mjs";

/**
 * Produce a merged SliceSnapshot from the outcomes. Only called when there
 * are zero conflicts.
 */
export function buildMergedSnapshot(req, outcomes) {
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
  // Then delete files that were dropped in the merged snapshot.
  for (const o of report.outcomes) {
    if (!o.element.startsWith("files/")) continue;
    if (o.mergedValue === null && (o.baseValue != null || o.consumerValue != null)) {
      const rel = o.element.slice("files/".length);
      const dest = path.join(targetDir, rel);
      if (existsSync(dest)) rmSync(dest, { force: true });
    }
  }
}
