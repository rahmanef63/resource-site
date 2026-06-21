// compose-solver-loader.mjs — contract discovery loader.
//
// Split out from compose-solver.mjs to keep the pure solver < 200 LOC.
// I/O entry point only — discovers slices under known roots and reads each
// folded contract from slice.json (`contract` block) via the shared adapter.
// No tsx subprocess: the contract lives in slice.json since the Phase-2 fold.

import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { loadSliceContract } from "./load-contract.mjs";

const SLICE_ROOT_GLOBS = [
  ["frontend", "slices"],
  ["template-base", "frontend", "slices"],
];

/**
 * Discover every slice with a folded contract under the kitab's known slice
 * roots. Returns a Map<slug, SliceContract>. Slices without a slice.json
 * contract block are silently skipped so a single uncontracted slice doesn't
 * take down the solver — `npm run audit:slices` surfaces shape errors.
 *
 * @param {string} repoRoot Absolute path to the kitab repo root.
 * @returns {Promise<Map<string, import("./contract").SliceContract>>}
 */
export async function loadAllContracts(repoRoot) {
  /** @type {Map<string, import("./contract").SliceContract>} */
  const out = new Map();
  for (const dir of await discoverSliceDirs(repoRoot)) {
    const contract = loadSliceContract(dir);
    if (contract && typeof contract.id === "string") {
      out.set(contract.id, contract);
    }
  }
  return out;
}

async function discoverSliceDirs(repoRoot) {
  const found = [];
  for (const segs of SLICE_ROOT_GLOBS) {
    const root = path.join(repoRoot, ...segs);
    if (!existsSync(root)) continue;
    const entries = await readdir(root, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith("_")) continue;
      const dir = path.join(root, entry.name);
      if (existsSync(path.join(dir, "slice.json"))) found.push(dir);
    }
  }
  return found;
}
