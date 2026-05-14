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

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const SLICES_ROOT = path.join(REPO, "frontend", "slices");
const CONVEX_ROOT = path.join(REPO, "convex", "features");

const ALLOWED_IMPORT_PREFIXES = [
  // App-relative shared / UI
  "@/components/ui/",
  "@/components/shared/",
  "@/lib/shared/",
  "@/lib/utils",
  "@/lib/utils.ts",
  "@/shared/",
  // Convex barrels
  "@convex/",
  // Slice's own internal
  // (we check this via slice-relative match, not prefix)
  // Standard libs / frameworks
  "react",
  "react-dom",
  "next",
  "next/",
  "lucide-react",
  "convex",
  "convex/",
  "@convex-dev/",
  "zod",
  "clsx",
  "tailwind-merge",
];

const slices = discoverSlices();
const tableNames = new Map(); // name → owning slug
const schemasSeen = new Set(); // schemaPath → first slice that audited it (co-located providers share schemas)

const errors = [];
const warnings = [];

for (const slice of slices) {
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
    const imports = [...body.matchAll(/^\s*import[^"']*["']([^"']+)["']/gm)].map((m) => m[1]);
    for (const spec of imports) {
      if (isOwnSliceImport(spec, slice)) continue;
      if (isAllowedPrefix(spec)) continue;
      if (isRelativeWithinSlice(spec, file, slice.dir)) continue;
      if (isBareNpmImport(spec)) continue;
      errors.push(
        `[${slice.folder}] disallowed import in ${path.relative(REPO, file)}: "${spec}"`,
      );
    }
  }

  // 3. schema clash
  // Co-located provider slices (e.g. doku-payment + midtrans-payment) share one
  // schema file under convex/features/<group>/. Skip the collision check when a
  // slice points at a schemaPath that was already audited by a sibling — the
  // tables are the SAME declarations, not separate ones.
  const sharedSchema = slice.convexSchemaPath && schemasSeen.has(slice.convexSchemaPath);
  if (!sharedSchema) {
    const tables = extractTables(slice);
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

const isCheck = process.argv.includes("--check");

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

// ───────────────────────────────────────────────────────────────────

function discoverSlices() {
  if (!existsSync(SLICES_ROOT)) return [];
  const out = [];
  for (const name of readdirSync(SLICES_ROOT)) {
    if (name.startsWith("_") || name.startsWith(".")) continue;
    const dir = path.join(SLICES_ROOT, name);
    if (!statSync(dir).isDirectory()) continue;
    const sj = path.join(dir, "slice.json");
    if (!existsSync(sj)) continue;
    const meta = JSON.parse(readFileSync(sj, "utf8"));
    out.push({
      folder: name,
      dir,
      slugFromJson: meta.slug,
      titleFromJson: meta.title,
      categoryFromJson: meta.category,
      configExport: meta.frontend?.configExport,
      tablesExport: meta.convex?.tablesExport,
      convexSchemaPath: meta.convex?.schemaPath,
      convexRootPaths: meta.convex?.rootPaths ?? [],
    });
  }
  return out;
}

function camelCase(slug) {
  return slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function findTsFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...findTsFiles(full));
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

function isAllowedPrefix(spec) {
  return ALLOWED_IMPORT_PREFIXES.some((p) => spec === p || spec.startsWith(p));
}

function isOwnSliceImport(spec, slice) {
  return spec.startsWith(`@/features/${slice.folder}/`) || spec === `@/features/${slice.folder}`;
}

function isRelativeWithinSlice(spec, file, sliceDir) {
  if (!spec.startsWith(".")) return false;
  const target = path.resolve(path.dirname(file), spec);
  return target.startsWith(sliceDir);
}

function isBareNpmImport(spec) {
  // Heuristic: not relative, not absolute alias, no leading slash, contains
  // at most one slash before '/' (or scoped pkg). Allow scoped packages too.
  if (spec.startsWith(".") || spec.startsWith("/") || spec.startsWith("@/") || spec.startsWith("@convex/")) return false;
  return true;
}

function extractTables(slice) {
  const tables = [];
  for (const rp of slice.convexRootPaths) {
    const schemaFile = path.join(REPO, rp, "schema.ts");
    if (!existsSync(schemaFile)) continue;
    const body = readFileSync(schemaFile, "utf8");
    // Match `tableName: defineTable(`
    const matches = [...body.matchAll(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*defineTable\(/gm)];
    for (const m of matches) tables.push(m[1]);
  }
  return tables;
}

function readSliceConfig(slice) {
  const file = path.join(slice.dir, "config.ts");
  if (!existsSync(file)) return null;
  const body = readFileSync(file, "utf8");
  // Brittle but cheap: pull literal values for slug/title/category.
  const grab = (key) => {
    const m = body.match(new RegExp(`${key}\\s*:\\s*"([^"]+)"`));
    return m ? m[1] : null;
  };
  return { slug: grab("slug"), title: grab("title"), category: grab("category") };
}
