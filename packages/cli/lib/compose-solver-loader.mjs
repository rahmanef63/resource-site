// compose-solver-loader.mjs — contract discovery + tsx-eval loader.
//
// Split out from compose-solver.mjs to keep the pure solver < 200 LOC.
// I/O entry point only — discovers `slice.contract.ts` under known slice
// roots and shells out to `npx tsx` to JSON-serialize each export.

import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

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
