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

// Entry-window pairing: each slug owns the text up to the NEXT slug
// occurrence; a version is only attributed if it falls inside that window.
// (A lazy `slug…version` regex steals the next entry's version when an entry
// has none — misattributing the drift.) Peer objects ({slug, range}) carry no
// version, so their windows never match.
const slugRe = /slug:\s*"([^"]+)"/g;
const positions = [];
let m;
while ((m = slugRe.exec(src))) positions.push({ slug: m[1], start: m.index });
const pairs = new Map();
for (let i = 0; i < positions.length; i++) {
  const end = i + 1 < positions.length ? positions[i + 1].start : src.length;
  const win = src.slice(positions[i].start, end);
  const v = win.match(/version:\s*"([0-9]+\.[0-9]+\.[0-9]+)"/);
  if (v && !pairs.has(positions[i].slug)) pairs.set(positions[i].slug, v[1]);
}

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
