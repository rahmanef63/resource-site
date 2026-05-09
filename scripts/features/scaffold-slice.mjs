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
// All edits stay local — does NOT commit, push, or publish.

import {
  cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync,
} from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

// 1+2. Copy both halves
cpSync(FRONTEND_TEMPLATE, frontendDest, { recursive: true });
console.log(`  ✓ ${path.relative(REPO, frontendDest)}`);
cpSync(CONVEX_TEMPLATE, convexDest, { recursive: true });
console.log(`  ✓ ${path.relative(REPO, convexDest)}`);

// 3. Rewrite identifiers
rewriteTree(frontendDest);
rewriteTree(convexDest);
console.log(`  ✓ rewrote identifiers (${slug} / ${camelCase(slug)} / ${pascalCase(slug)})`);

// 4. Patch slice.json
const sliceJsonPath = path.join(frontendDest, "slice.json");
const sliceJson = JSON.parse(readFileSync(sliceJsonPath, "utf8"));
sliceJson.category = category;
sliceJson.title = title;
sliceJson.description = description;
sliceJson.tags = ["new"];
writeFileSync(sliceJsonPath, JSON.stringify(sliceJson, null, 2) + "\n");
console.log(`  ✓ patched slice.json (category=${category})`);

// 4b. Patch config.ts — title + category fields are human text, not identifiers.
const configTsPath = path.join(frontendDest, "config.ts");
if (existsSync(configTsPath)) {
  let cfg = readFileSync(configTsPath, "utf8");
  cfg = cfg
    .replace(/title:\s*"Example Feature"/, `title: ${JSON.stringify(title)}`)
    .replace(/category:\s*"[^"]*"/, `category: "${category}"`);
  writeFileSync(configTsPath, cfg);
  console.log(`  ✓ patched config.ts (title + category)`);
}

// 5. Append stub row to lib/content/slices.ts
appendSliceEntry({ slug, title, category, description });
console.log(`  ✓ appended SliceEntry to lib/content/slices.ts`);

// 6. Regenerate registries (new slice → new entry in the auto-emitted files)
console.log(`\n→ Regenerating registries\n`);
try {
  execSync("npm run gen:slices", { cwd: REPO, stdio: "inherit" });
} catch {
  console.error(`\n✖ gen:slices failed.`);
  process.exit(1);
}

// 7. Validate + audit (the gen-drift check is now satisfied by step 6)
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

// ─── helpers ───────────────────────────────────────────────────────────

function rewriteTree(dir) {
  const fromCamel = "exampleFeature";
  const fromPascal = "ExampleFeature";
  const fromSlug = "example-feature";
  const toCamel = camelCase(slug);
  const toPascal = pascalCase(slug);

  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      rewriteTree(full);
      continue;
    }
    let body = readFileSync(full, "utf8");
    const before = body;
    body = body
      .replaceAll(fromSlug, slug)
      .replaceAll(fromPascal, toPascal)
      .replaceAll(fromCamel, toCamel);
    if (body !== before) writeFileSync(full, body);
  }
}

function appendSliceEntry({ slug, title, category, description }) {
  const src = readFileSync(SLICES_TS, "utf8");
  if (src.includes(`slug: "${slug}"`)) {
    console.log(`  · slices.ts already has "${slug}" — skipping append`);
    return;
  }

  const stub = `  {
    slug: "${slug}",
    title: ${JSON.stringify(title)},
    category: "${category}",
    version: "0.1.0",
    description: ${JSON.stringify(description)},
    source: "rahmanef63/resource-site",
    slicePath: "frontend/slices/${slug}",
    convexPaths: ["convex/features/${slug}"],
    npm: [],
    shadcn: ["button", "card"],
    env: [],
    peers: [],
    tags: ["new"],
    agentRecipe: "Run \`rr add ${slug}\`. Replace this stub recipe with concrete steps.",
  },
`;

  // Inject before the closing `];` of the `slices` array.
  const closingIdx = src.lastIndexOf("];");
  if (closingIdx === -1) fail("Could not find closing `];` in lib/content/slices.ts — append manually.");

  const next = src.slice(0, closingIdx) + stub + src.slice(closingIdx);
  writeFileSync(SLICES_TS, next);
}

function camelCase(s) {
  return s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}
function pascalCase(s) {
  const c = camelCase(s);
  return c.charAt(0).toUpperCase() + c.slice(1);
}
function toTitleCase(s) {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) { out[key] = next; i++; }
    else out[key] = true;
  }
  return out;
}

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}
