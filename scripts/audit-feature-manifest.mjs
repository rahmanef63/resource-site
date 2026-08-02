#!/usr/bin/env node
// BI-wave — audit which rr slices have a `config.ts` manifest
// (defineFeature() call). Informational — never exits non-zero.

import { readdirSync, existsSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "frontend/slices";

function listSlices(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root)
    .filter((name) => !name.startsWith("_") && !name.startsWith(".")) // M4-BO — skip scaffolding (`_templates`) + dotfiles (matches sync-slice-manifests.mjs convention)
    .map((name) => ({ name, path: join(root, name) }))
    .filter((e) => statSync(e.path).isDirectory());
}

const slices = listSlices(ROOT);
const withManifest = [];
const withoutManifest = [];

for (const slice of slices) {
  const cfgPath = join(slice.path, "config.ts");
  if (existsSync(cfgPath)) {
    const body = readFileSync(cfgPath, "utf8");
    const hasDefine = body.includes("defineFeature(");
    withManifest.push({ ...slice, hasDefine });
  } else {
    withoutManifest.push(slice);
  }
}

console.log(`\n═══ Feature manifest audit (${slices.length} slices) ═══\n`);
console.log(`✓ ${withManifest.length} with config.ts:`);
for (const s of withManifest) {
  const mark = s.hasDefine ? "✓" : "⚠ no defineFeature call";
  console.log(`  ${mark} ${s.name}`);
}
console.log(`\n✗ ${withoutManifest.length} missing config.ts:`);
for (const s of withoutManifest) console.log(`  - ${s.name}`);

const coverage = ((withManifest.length / slices.length) * 100).toFixed(1);
console.log(`\nCoverage: ${coverage}% (${withManifest.length}/${slices.length})`);
console.log(
  `\nNext: backfill missing — copy frontend/slices/landing-sections/config.ts as the template.`,
);
