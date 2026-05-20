#!/usr/bin/env node
// sync-slice-manifests.mjs — regenerate per-slice `slice.manifest.json`
// `files: [...]` array from current filesystem state.
//
// After every slice refactor (split into smaller modules), the manifest's
// file list drifts. CLI distribution uses this list — drift → consumer
// install silently misses files.
//
// Preserves: `slug`, `version`, `tier`, `distribution`, `convex`, `imports`
// (only `files` field is regenerated).
//
// Run: node scripts/validation/sync-slice-manifests.mjs [--check]
//   --check : exit 1 if any manifest needs update (CI mode)
//   default : write updated manifests
//
// File inclusion rules:
//   IN  : .ts / .tsx / .md / .css under the slice dir (recursive)
//   OUT : slice.json / slice.contract.ts / slice.manifest.json / *.test.* / node_modules

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const SLICES_ROOT = path.join(REPO, "frontend", "slices");

const isCheck = process.argv.includes("--check");
const changes = [];
const errors = [];

for (const name of readdirSync(SLICES_ROOT)) {
  if (name.startsWith("_") || name.startsWith(".")) continue;
  const dir = path.join(SLICES_ROOT, name);
  if (!statSync(dir).isDirectory()) continue;
  const manifestPath = path.join(dir, "slice.manifest.json");
  const slicePath = path.join(dir, "slice.json");
  if (!existsSync(manifestPath)) {
    // Catalog-only slices (M4-BO) — config.ts present but no slice.json
    // means the slice's implementation lives in `_shared/` or another
    // template-managed location, not as a stand-alone distributable.
    // Skip silently — these are intentionally not in the CLI ship list.
    if (!existsSync(slicePath)) continue;
    errors.push(`[${name}] missing slice.manifest.json — scaffold first`);
    continue;
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  // Legacy Schema B manifests use `files: { include: [...], exclude: [...] }`
  // (glob-pattern style). These are still valid per docs/slice.manifest.schema.json
  // and the CLI's manifest:sync handles them. Skip — only regen modern array
  // shape (Schema A: `files: ["path", ...]`).
  if (!Array.isArray(manifest.files)) continue;

  const actualFiles = listSliceFiles(dir).sort();
  const previousFiles = manifest.files.slice().sort();

  if (sameArray(actualFiles, previousFiles)) continue;

  const added = actualFiles.filter((f) => !previousFiles.includes(f));
  const removed = previousFiles.filter((f) => !actualFiles.includes(f));
  changes.push({ slug: name, manifestPath, added, removed, actualFiles });

  if (!isCheck) {
    manifest.files = actualFiles;
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  }
}

if (errors.length > 0) {
  for (const e of errors) console.error(`✖ ${e}`);
}

if (changes.length === 0 && errors.length === 0) {
  console.log("✓ sync-slice-manifests: all manifests already match filesystem");
  process.exit(0);
}

if (isCheck) {
  console.error(`\n✖ ${changes.length} manifest(s) out of sync:`);
  for (const c of changes) {
    console.error(`  [${c.slug}]`);
    for (const f of c.added) console.error(`    + ${f}`);
    for (const f of c.removed) console.error(`    - ${f}`);
  }
  console.error(`\nRun: node scripts/validation/sync-slice-manifests.mjs`);
  process.exit(1);
}

console.log(`✓ sync-slice-manifests: wrote ${changes.length} manifest(s)`);
for (const c of changes) {
  console.log(`  [${c.slug}] +${c.added.length} -${c.removed.length}`);
}
process.exit(errors.length > 0 ? 1 : 0);

// ───────────────────────────────────────────────────────────────────

function listSliceFiles(sliceDir) {
  const out = [];
  walk(sliceDir, sliceDir, out);
  return out;
}

function walk(root, dir, out) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = path.join(dir, name);
    const rel = path.relative(root, full).replaceAll(path.sep, "/");
    const s = statSync(full);
    if (s.isDirectory()) { walk(root, full, out); continue; }
    // Skip the trio metadata itself + test files
    if (rel === "slice.json") continue;
    if (rel === "slice.contract.ts") continue;
    if (rel === "slice.manifest.json") continue;
    if (/\.test\.(ts|tsx|mjs|js)$/.test(name)) continue;
    if (!/\.(ts|tsx|md|css|mjs)$/.test(name)) continue;
    out.push(rel);
  }
}

function sameArray(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
