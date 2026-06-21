#!/usr/bin/env node
// gen-slice-catalog.mjs — regenerate the SCALAR fields of each
// lib/content/slices.ts entry FROM its slice.json (the per-slice SSOT). Kills
// the hand-copy drift class that validate-slice-parity.mjs used to police
// (slug/version/category/title/kind) by making divergence structurally
// impossible: the catalog scalar is GENERATED, not hand-typed.
//
// ONLY single-line scalar fields are rewritten in place: version, category,
// title, kind. Prose (tagline/description/exampleCode/agentRecipe/wiring/…)
// stays HAND-AUTHORED in slices.ts. Critical boundary: `npx rr add` tiged-copies
// the whole slice tree, so slice.json ships to consumers — catalog/marketing
// prose must NOT live there. slices.ts is the rr-internal prose home; we only
// pull the scalars across.
//
// Run:  node scripts/features/gen-slice-catalog.mjs          (rewrite in place)
//       node scripts/features/gen-slice-catalog.mjs --check  (exit 1 on drift)

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSlices } from "../../packages/cli/scripts/parse-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const CATALOG = path.join(REPO, "lib", "content", "slices.ts");

// slug → resolved slice.json (the SSOT), keyed via each catalog entry's
// `slicePath` — exactly how validate-slice-parity resolved it. NOT by slug:
// a few entries (e.g. event-tracking) point at a slice.json whose folder name
// differs from the catalog slug, so slug-keying would pull the wrong source.
const ssot = new Map();
const missing = [];
for (const e of loadSlices()) {
  if (!e.slicePath) continue; // registry-only entry, no on-disk source
  const jp = path.join(REPO, e.slicePath, "slice.json");
  if (!existsSync(jp)) {
    missing.push(`${e.slug} (${e.slicePath})`);
    continue;
  }
  ssot.set(e.slug, JSON.parse(readFileSync(jp, "utf8")));
}
if (missing.length) {
  console.error(
    `✖ gen:catalog: catalog entries declare a slicePath with no slice.json:\n  ${missing.join("\n  ")}`,
  );
  process.exit(1);
}

// In-place scalar rewrite. Entry boundary = a 4-space `slug:` line; scalar
// fields sit at the same 4-space indent. Deeper-indented (6+) slug:/version:
// inside peers/compat/variants never match, so they're left untouched.
const slugRe = /^ {4}slug:\s*"([^"]+)"/;
const fieldRe = /^( {4}(version|category|title|kind):\s*)"(?:[^"\\]|\\.)*"(.*)$/;

const src = readFileSync(CATALOG, "utf8");
let cur = null;
const out = src.split("\n").map((line) => {
  const sm = line.match(slugRe);
  if (sm) {
    cur = sm[1];
    return line;
  }
  if (!cur || !ssot.has(cur)) return line;
  const fm = line.match(fieldRe);
  if (!fm) return line;
  const val = ssot.get(cur)[fm[2]];
  if (val === undefined) return line; // slice.json doesn't declare it → leave
  return fm[1] + JSON.stringify(val) + fm[3];
});
const result = out.join("\n");

const check = process.argv.includes("--check");
if (result === src) {
  console.log(`✓ gen:catalog: ${ssot.size} slice scalars in sync`);
  process.exit(0);
}
if (check) {
  const lines = src.split("\n");
  const changed = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] !== out[i]) changed.push(`  L${i + 1}: ${lines[i].trim()}  →  ${out[i].trim()}`);
  }
  console.error("✖ gen:catalog: slices.ts scalars drift from slice.json. Run: npm run gen:catalog");
  console.error(changed.slice(0, 30).join("\n"));
  process.exit(1);
}
writeFileSync(CATALOG, result);
console.log(`✓ gen:catalog: wrote ${ssot.size} slice scalars into slices.ts`);
