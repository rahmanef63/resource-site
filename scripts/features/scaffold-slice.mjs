#!/usr/bin/env node
// scaffold-slice.mjs — local-first slice scaffolder.
//
// Run from the kitab repo root:
//   npm run new:slice -- --slug doku-payment --category payment --title "Doku — Indonesia Payment"
//
// What it does:
//   1. Copy frontend/slices/_templates/example-feature/ → frontend/slices/<slug>/
//   2. Copy convex/features/example-feature/ → convex/features/<slug>/
//   3. Rewrite identifiers (slug, camelSlug, PascalSlug) in every file
//   4. Patch slice.json category + title + description
//   5. Append a stub SliceEntry to lib/content/slices.ts
//   6. Run `npm run slices:check` so author sees green or fails fast
//
// Helpers in ./scaffold-slice-helpers.mjs. All edits stay local — does NOT
// commit, push, or publish.

import { cpSync, existsSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  parseArgs, toTitleCase, rewriteTree, appendSliceEntry,
  patchSliceConfig, patchConfigTs, camelCase, pascalCase,
} from "./scaffold-slice-helpers.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const FRONTEND_TEMPLATE = path.join(REPO, "frontend/slices/_templates/example-feature");
const CONVEX_TEMPLATE = path.join(REPO, "convex/features/example-feature");
const SLICES_TS = path.join(REPO, "lib/content/slices.ts");

const VALID_CATEGORIES = ["ai", "auth", "data", "payment", "email", "realtime", "storage", "search", "content", "ui", "infra"];

const args = parseArgs(process.argv.slice(2));

if (!args.slug) {
  console.error("Usage: npm run new:slice -- --slug <slug> [--category <cat>] [--title \"...\"] [--description \"...\"]");
  console.error("\nCategories:", VALID_CATEGORIES.join(", "));
  process.exit(1);
}

const slug = args.slug;
const category = args.category ?? "data";
const title = args.title ?? toTitleCase(slug);
const description = args.description ?? `${title} — drop-in slice. Replace this description before publishing.`;

if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
  fail(`Slug must be kebab-case (got "${slug}").`);
}
if (!VALID_CATEGORIES.includes(category)) {
  fail(`--category must be one of: ${VALID_CATEGORIES.join(", ")}`);
}

const frontendDest = path.join(REPO, "frontend/slices", slug);
const convexDest = path.join(REPO, "convex/features", slug);

if (existsSync(frontendDest)) fail(`Already exists: ${path.relative(REPO, frontendDest)}`);
if (existsSync(convexDest)) fail(`Already exists: ${path.relative(REPO, convexDest)}`);
if (!existsSync(FRONTEND_TEMPLATE)) fail(`Template missing: ${FRONTEND_TEMPLATE}`);
if (!existsSync(CONVEX_TEMPLATE)) fail(`Template missing: ${CONVEX_TEMPLATE}`);

console.log(`\n→ Scaffolding slice ${slug} (${category})\n`);

// 1+2. Copy both halves.
cpSync(FRONTEND_TEMPLATE, frontendDest, { recursive: true });
console.log(`  ✓ ${path.relative(REPO, frontendDest)}`);
cpSync(CONVEX_TEMPLATE, convexDest, { recursive: true });
console.log(`  ✓ ${path.relative(REPO, convexDest)}`);

// 3. Rewrite identifiers.
rewriteTree(frontendDest, slug);
rewriteTree(convexDest, slug);
console.log(`  ✓ rewrote identifiers (${slug} / ${camelCase(slug)} / ${pascalCase(slug)})`);

// 4. Patch slice.json.
const { sliceJson, sliceJsonPath } = patchSliceConfig(frontendDest, { title, category });
sliceJson.description = description;
writeFileSync(sliceJsonPath, JSON.stringify(sliceJson, null, 2) + "\n");
console.log(`  ✓ patched slice.json (category=${category})`);

// 4b. Patch config.ts — title + category fields are human text, not identifiers.
if (patchConfigTs(frontendDest, { title, category })) {
  console.log(`  ✓ patched config.ts (title + category)`);
}

// 5. Append stub row to lib/content/slices.ts.
appendSliceEntry({ slug, title, category, description }, SLICES_TS, fail);
console.log(`  ✓ appended SliceEntry to lib/content/slices.ts`);

// 6. Regenerate registries (new slice → new entry in the auto-emitted files).
console.log(`\n→ Regenerating registries\n`);
try {
  execSync("npm run gen:slices", { cwd: REPO, stdio: "inherit" });
} catch {
  console.error(`\n✖ gen:slices failed.`);
  process.exit(1);
}

// 7. Validate + audit (the gen-drift check is now satisfied by step 6).
console.log(`\n→ Validating\n`);
try {
  execSync("npm run validate:slices && npm run audit:slices", { cwd: REPO, stdio: "inherit" });
} catch {
  console.error(`\n✖ validation failed. Fix the issues above and re-run.`);
  process.exit(1);
}

console.log(`\n✓ Slice ${slug} scaffolded and registered.\n`);
console.log(`Next:`);
console.log(`  1. Replace stub UI in ${path.relative(REPO, frontendDest)}/{page,components}/`);
console.log(`  2. Define backend in ${path.relative(REPO, convexDest)}/{schema,queries,mutations}.ts`);
console.log(`  3. Fill rich metadata in lib/content/slices.ts (docsUrl, install, exampleCode, agentRecipe)`);
console.log(`  4. Run: node packages/cli/scripts/gen-manifest.mjs`);
console.log(`  5. Commit + (when ready) bump CLI/MCP versions and publish.\n`);

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}
