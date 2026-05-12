#!/usr/bin/env node
// validate-slice-parity.mjs — gate parity between TS SliceEntry (in
// lib/content/slices.ts) and disk slice.json files.
//
// As of Phase 5 (docs/REFACTOR-PLAN.md, 2026-05-12) the two coexist:
//   - TS SliceEntry  → site catalog (descriptions, compat, preview, usedBy)
//   - slice.json     → CLI install manifest (paths, deps, audit gates)
//
// Shared fields MUST agree. Drift = bug. This check enforces:
//   slug, version, category, title  ←  must equal across both
//   kind                            ←  if both declare it, must equal
//
// Run: node packages/cli/scripts/validate-slice-parity.mjs [--check] [--json]
//
// No external deps. Exits 1 on any drift.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSlices } from "./parse-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../..");

const args = process.argv.slice(2);
const asJson = args.includes("--json");

const slices = loadSlices();

const errors = [];
const skipped = [];
let checked = 0;

for (const s of slices) {
  if (!s.slicePath) {
    skipped.push({ slug: s.slug, reason: "no slicePath (registry-only)" });
    continue;
  }
  const jsonPath = path.join(REPO, s.slicePath, "slice.json");
  if (!existsSync(jsonPath)) {
    skipped.push({ slug: s.slug, reason: `no slice.json at ${path.relative(REPO, jsonPath)}` });
    continue;
  }
  let json;
  try {
    json = JSON.parse(readFileSync(jsonPath, "utf8"));
  } catch (e) {
    errors.push({ slug: s.slug, field: "(parse)", ts: "", json: e.message });
    continue;
  }
  checked++;
  // Shared fields must agree.
  const pairs = [
    ["slug", s.slug, json.slug],
    ["version", s.version, json.version],
    ["category", s.category, json.category],
    ["title", s.title, json.title],
  ];
  if (s.kind !== undefined && json.kind !== undefined) {
    pairs.push(["kind", s.kind, json.kind]);
  }
  for (const [field, tsVal, jsonVal] of pairs) {
    if (tsVal !== jsonVal) {
      errors.push({ slug: s.slug, field, ts: tsVal, json: jsonVal });
    }
  }
}

if (asJson) {
  console.log(JSON.stringify({ checked, skipped, errors }, null, 2));
} else {
  console.log(`Parity check: ${checked} slice.json files vs TS entries`);
  if (skipped.length > 0) {
    console.log(`\n${skipped.length} skipped:`);
    for (const s of skipped) console.log(`  · ${s.slug} — ${s.reason}`);
  }
  if (errors.length > 0) {
    console.error(`\n${errors.length} drift error(s):`);
    for (const e of errors) {
      console.error(`  ✖ ${e.slug}.${e.field}: TS=${JSON.stringify(e.ts)} vs JSON=${JSON.stringify(e.json)}`);
    }
  } else {
    console.log(`\n✓ no drift`);
  }
}

process.exit(errors.length > 0 ? 1 : 0);
