#!/usr/bin/env node
// audit-slice.mjs — kitab-scope audit-bp pass.
//
// Runs against every `frontend/slices/<slug>/` (skips `_templates/`):
//   1. naming        — slug matches folder, configExport matches camelCase
//   2. imports       — slice files only import from allowed prefixes
//   3. schema clash  — convex table names don't collide across slices
//   4. config agrees — slice.json fields match config.ts export
//
// No external deps. Run: node scripts/validation/audit-slice.mjs [--check]
//
// Pure helpers (discoverSlices, findTsFiles, isAllowedPrefix, …) live in
// audit-slice-helpers.mjs to keep this file ≤200 LOC.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  camelCase,
  discoverSlices,
  extractTables,
  findTsFiles,
  isAllowedPrefix,
  isBareNpmImport,
  isOwnSliceImport,
  isRelativeWithinSlice,
  lintStyleAntipatterns,
  readSliceConfig,
} from "./audit-slice-helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const SLICES_ROOT = path.join(REPO, "frontend", "slices");

const slices = discoverSlices(SLICES_ROOT);
const tableNames = new Map(); // name → owning slug
const schemasSeen = new Set(); // schemaPath → first slice that audited it

const errors = [];
const warnings = [];

for (const slice of slices) {
  // 0. metadata trio enforcement
  if (!existsSync(path.join(slice.dir, "slice.contract.ts"))) {
    errors.push(`[${slice.folder}] missing slice.contract.ts (metadata trio)`);
  }
  if (!existsSync(path.join(slice.dir, "slice.manifest.json"))) {
    errors.push(`[${slice.folder}] missing slice.manifest.json (metadata trio)`);
  }

  // 1. naming
  if (slice.slugFromJson !== slice.folder) {
    errors.push(
      `[${slice.folder}] slice.json slug "${slice.slugFromJson}" != folder "${slice.folder}"`,
    );
  }
  const expectedCamel = camelCase(slice.folder);
  if (slice.configExport && !slice.configExport.startsWith(expectedCamel)) {
    warnings.push(
      `[${slice.folder}] configExport "${slice.configExport}" doesn't begin with camelCase("${slice.folder}") = "${expectedCamel}"`,
    );
  }

  // 2. imports
  const tsFiles = findTsFiles(slice.dir);
  for (const file of tsFiles) {
    // slice.contract.ts is the Phase-A contract DSL — by design it imports
    // `defineSliceContract` from packages/cli/lib/contract. Skip the import
    // walk for that single file.
    if (path.basename(file) === "slice.contract.ts") continue;
    const body = readFileSync(file, "utf8");
    const imports = [...body.matchAll(/^\s*import[^"']*["']([^"']+)["']/gm)].map(
      (m) => m[1],
    );
    for (const spec of imports) {
      if (isOwnSliceImport(spec, slice)) continue;
      if (isAllowedPrefix(spec)) continue;
      if (isRelativeWithinSlice(spec, file, slice.dir)) continue;
      if (isBareNpmImport(spec)) continue;
      errors.push(
        `[${slice.folder}] disallowed import in ${path.relative(REPO, file)}: "${spec}"`,
      );
    }
    // 2b. style anti-patterns (P5) — advisory warnings (raw-interp className,
    // hardcoded hex in className).
    for (const w of lintStyleAntipatterns(path.relative(REPO, file), body)) {
      warnings.push(`[${slice.folder}] ${w}`);
    }
  }

  // 3. schema clash — co-located provider slices share one schema file; skip
  // the collision check when a slice points at a schemaPath that was already
  // audited by a sibling (tables are the SAME declarations).
  const sharedSchema =
    slice.convexSchemaPath && schemasSeen.has(slice.convexSchemaPath);
  if (!sharedSchema) {
    const tables = extractTables(slice, REPO);
    for (const t of tables) {
      if (tableNames.has(t)) {
        errors.push(
          `[${slice.folder}] convex table "${t}" already declared by slice "${tableNames.get(t)}"`,
        );
      } else {
        tableNames.set(t, slice.folder);
      }
    }
    if (slice.convexSchemaPath) schemasSeen.add(slice.convexSchemaPath);
  }

  // 4. config.ts agreement
  const cfg = readSliceConfig(slice);
  if (cfg) {
    if (cfg.slug && cfg.slug !== slice.slugFromJson) {
      errors.push(
        `[${slice.folder}] config.ts slug "${cfg.slug}" != slice.json slug "${slice.slugFromJson}"`,
      );
    }
    if (cfg.title && cfg.title !== slice.titleFromJson) {
      warnings.push(
        `[${slice.folder}] config.ts title "${cfg.title}" != slice.json title "${slice.titleFromJson}"`,
      );
    }
    if (cfg.category && cfg.category !== slice.categoryFromJson) {
      errors.push(
        `[${slice.folder}] config.ts category "${cfg.category}" != slice.json category "${slice.categoryFromJson}"`,
      );
    }
  }
}

if (errors.length === 0 && warnings.length === 0) {
  console.log(`✓ audit-slice: ${slices.length} slice(s) OK`);
  process.exit(0);
}

if (warnings.length > 0) {
  console.log(`⚠ ${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  · ${w}`);
}
if (errors.length > 0) {
  console.error(`\n✖ ${errors.length} error(s):`);
  for (const e of errors) console.error(`  · ${e}`);
}

process.exit(errors.length > 0 ? 1 : 0);
