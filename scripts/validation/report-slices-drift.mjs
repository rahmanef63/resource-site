#!/usr/bin/env node
// WARN-ONLY report: version drift between lib/content/slices.ts (the
// hand-curated catalog SSOT consumed by the /slices page + Bundle Builder +
// MCP) and each slice's slice.json (the version SSOT, gated by audit:slices).
//
// slices.ts carries a per-entry `version:` that nobody bumps when a slice's
// slice.json moves, so the catalog quietly shows stale versions. This makes
// that drift visible without a blocking gate (a hard gate would wedge every
// commit until ~37 hand-edits land; the durable fix is to GENERATE the catalog
// version from slice.json — tracked separately). Never exits non-zero.
//
// Run: node scripts/validation/report-slices-drift.mjs

import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

const src = readFileSync(path.join(ROOT, "lib/content/slices.ts"), "utf8");
const aliases = JSON.parse(
  readFileSync(path.join(ROOT, "lib/content/slice-aliases.json"), "utf8"),
);

// Lazy slug→nearest-version within the same entry object. Same shape the
// existing regex-fallback validators rely on.
const re = /slug:\s*"([^"]+)"[\s\S]*?version:\s*"([0-9]+\.[0-9]+\.[0-9]+)"/g;
const pairs = new Map();
let m;
while ((m = re.exec(src))) if (!pairs.has(m[1])) pairs.set(m[1], m[2]);

const sliceJsonVersion = (slug) => {
  for (const base of ["frontend/slices", "template-base/frontend/slices"]) {
    const p = path.join(ROOT, base, slug, "slice.json");
    if (existsSync(p)) {
      try {
        return JSON.parse(readFileSync(p, "utf8")).version ?? null;
      } catch {
        return null;
      }
    }
  }
  return undefined; // no slice.json anywhere
};

const drift = [];
const dangling = [];
for (const [slug, catVer] of pairs) {
  const jv = sliceJsonVersion(slug);
  if (jv === undefined) {
    if (!(slug in aliases)) dangling.push(slug);
  } else if (jv && jv !== catVer) {
    drift.push(`${slug} (catalog ${catVer} → slice.json ${jv})`);
  }
}

console.log(`slices.ts drift report — ${pairs.size} catalog entries with a version`);
if (drift.length) {
  console.log(`  version drift (${drift.length}):`);
  for (const d of drift.sort()) console.log(`    · ${d}`);
} else {
  console.log("  version drift: none");
}
if (dangling.length) {
  console.log(
    `  no slice.json found (${dangling.length}) — catalog-only or renamed: ${dangling.sort().join(", ")}`,
  );
}
console.log(
  "  (warn-only — slice.json is the version SSOT; catalog version is display-only. Durable fix: generate it from slice.json.)",
);
