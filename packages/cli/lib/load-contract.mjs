// load-contract.mjs — read a slice's folded composition contract from its
// slice.json (Phase 2 SSOT). Replaces parsing slice.contract.ts: the contract
// payload now lives under slice.json `contract`, with id/version omitted there
// (they are the slice.json scalars). This adapter reattaches them so callers
// get the same SliceContract shape the .ts used to export.
//
// Returns undefined when the slice has no slice.json or no contract block —
// callers treat that exactly like a missing slice.contract.ts before.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * @param {string} sliceDir Absolute path to frontend/slices/<slug>/.
 * @returns {object|undefined} { id, version, requires?, provides?, conflicts?,
 *   migrationFrom?, generalization? } or undefined.
 */
export function loadSliceContract(sliceDir) {
  return contractFromJson(path.join(sliceDir, "slice.json"));
}

/** Same, given a direct path to a slice.json file. */
export function contractFromJson(jsonPath) {
  if (!existsSync(jsonPath)) return undefined;
  let j;
  try {
    j = JSON.parse(readFileSync(jsonPath, "utf8"));
  } catch {
    return undefined;
  }
  if (!j.contract || typeof j.contract !== "object") return undefined;
  return { id: j.slug, version: j.version, ...j.contract };
}
