#!/usr/bin/env node
// audit-convex-features — enforce canonical per-feature shape under convex/features/.
//
// Canon (N-wave 2026-05-18):
//   convex/features/<slug>/
//   ├── _schema.ts      REQUIRED — defineTable() + `<slug>Tables` export
//   ├── query.ts        OPTIONAL — `query()` exports
//   ├── mutation.ts     OPTIONAL — `mutation()` exports
//   ├── action.ts       OPTIONAL — `action()` exports
//   ├── http.ts         OPTIONAL — `httpAction()` routes
//   ├── _helpers.ts     OPTIONAL — private helpers (underscore = feature-internal)
//   ├── _types.ts       OPTIONAL — private TS types
//   └── README.md       REQUIRED
//
// Rules:
//   - schema.ts (no underscore) BANNED → must be _schema.ts
//   - mutations.ts / queries.ts / actions.ts BANNED (plural) → singular
//   - Every feature MUST have _schema.ts + README.md
//   - Subfolders under a feature MAY use any naming (e.g., actions/<provider>.ts
//     for nested provider implementations) — canon applies to top-level only.
//
// Exit: 0 clean, 1 errors.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const FEATURES_DIR = path.join(ROOT, "convex", "features");

const BANNED = new Set(["schema.ts", "mutations.ts", "queries.ts", "actions.ts"]);
const REQUIRED_ERROR = ["_schema.ts"]; // hard errors
const REQUIRED_WARN = ["README.md"]; // warn but don't fail
const ALLOWED_TOPLEVEL = new Set([
  "_schema.ts",
  "query.ts",
  "mutation.ts",
  "action.ts",
  "http.ts",
  "README.md",
  "index.ts",
  "slice.json",
  "slice.contract.ts",
  "slice.manifest.json",
  "auth.config.ts", // Convex auth config — special, framework-required name
  "auth.ts", // @convex-dev/auth entry — convexAuth() handlers live here by convention
]);
const ALLOWED_PREFIX = "_";

function main() {
  if (!fs.existsSync(FEATURES_DIR)) {
    console.error(`✗ ${FEATURES_DIR} missing`);
    process.exit(1);
  }

  const features = fs
    .readdirSync(FEATURES_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("_"))
    .map((e) => e.name)
    .sort();

  const errors = [];
  const warnings = [];

  for (const slug of features) {
    const dir = path.join(FEATURES_DIR, slug);
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files = entries.filter((e) => e.isFile()).map((e) => e.name);

    for (const req of REQUIRED_ERROR) {
      if (!files.includes(req)) {
        errors.push(`${slug}: missing required file ${req}`);
      }
    }
    for (const req of REQUIRED_WARN) {
      if (!files.includes(req)) {
        warnings.push(`${slug}: missing ${req} (recommended)`);
      }
    }

    for (const f of files) {
      if (BANNED.has(f)) {
        errors.push(`${slug}/${f}: BANNED — rename to ${canonOf(f)}`);
        continue;
      }
      const isTs = f.endsWith(".ts") || f.endsWith(".tsx");
      if (!isTs) continue;
      if (ALLOWED_TOPLEVEL.has(f)) continue;
      if (f.startsWith(ALLOWED_PREFIX)) continue;
      warnings.push(`${slug}/${f}: non-canonical name (consider _${f} for private, or fold into action/query/mutation)`);
    }

    // `auth` extends @convex-dev/auth's library-owned `authTables`, so it
    // exports `authTablesExt` (spread AFTER the library tables) rather than
    // its own `authTables` — the canonical name would shadow the library's.
    const schemaPath = path.join(dir, "_schema.ts");
    if (fs.existsSync(schemaPath) && slug !== "auth") {
      const src = fs.readFileSync(schemaPath, "utf8");
      const slugCamel = slug.replace(/[-_]([a-z])/g, (_, c) => c.toUpperCase());
      const expectedExport = new RegExp(`export\\s+const\\s+${slugCamel}Tables\\b`);
      if (!expectedExport.test(src)) {
        warnings.push(
          `${slug}/_schema.ts: missing 'export const ${slugCamel}Tables' (canon — needed for root schema composition)`,
        );
      }
    }
  }

  console.log(`\n═══ CONVEX FEATURE AUDIT ═══`);
  console.log(`Scanned ${features.length} feature(s)`);
  if (errors.length) {
    console.log(`\n✗ ${errors.length} error(s):`);
    for (const e of errors) console.log(`  • ${e}`);
  }
  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`  • ${w}`);
  }
  if (!errors.length && !warnings.length) {
    console.log(`✓ all features canonical`);
  }

  process.exit(errors.length ? 1 : 0);
}

function canonOf(banned) {
  return {
    "schema.ts": "_schema.ts",
    "mutations.ts": "mutation.ts",
    "queries.ts": "query.ts",
    "actions.ts": "action.ts",
  }[banned] ?? banned;
}

main();
