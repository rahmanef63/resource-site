#!/usr/bin/env node
// scaffold-template.mjs — clone a website template from an existing one.
//
// Templates live in three coordinated places:
//   1. app/preview/<slug>/{public,admin}/   — the actual pages
//   2. components/templates/<base>/          — slug-shared base + per-slice components
//   3. lib/content/layouts.ts                — registry row (category + pullPaths + ...)
//
// Run:
//   npm run new:template -- --slug my-os --from personal-brand-os --base my-base
//
// What it does:
//   1. Copy app/preview/<from>/ → app/preview/<slug>/ (rewrite path constants)
//   2. Copy components/templates/<from-base>/ → components/templates/<slug-base>/
//   3. Append a stub LayoutEntry to lib/content/layouts.ts
//   4. Run typecheck (light) — does NOT run full build (slow)

import {
  cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync,
} from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const PREVIEW_ROOT = path.join(REPO, "app/preview");
const TEMPLATES_ROOT = path.join(REPO, "components/templates");
const LAYOUTS_TS = path.join(REPO, "lib/content/layouts.ts");

const args = parseArgs(process.argv.slice(2));
if (!args.slug || !args.from) {
  console.error("Usage: npm run new:template -- --slug <new-slug> --from <existing-slug> [--base <new-base-name>] [--title \"...\"]");
  console.error("\nExamples:");
  console.error("  npm run new:template -- --slug clinic-os --from personal-brand-os");
  console.error("  npm run new:template -- --slug agency-x --from agency-studio-os --base agency-x");
  console.error("\nList existing templates: ls app/preview/");
  process.exit(1);
}

const slug = args.slug;
const fromSlug = args.from;
if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) fail(`Slug must be kebab-case (got "${slug}").`);
if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(fromSlug)) fail(`--from must be kebab-case (got "${fromSlug}").`);
const newBase = args.base ?? slug.replace(/-os$/, "");
const fromBase = inferBase(fromSlug);
const title = args.title ?? toTitleCase(slug);

if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(newBase)) fail(`Base must be kebab-case (got "${newBase}").`);

const fromPreview = path.join(PREVIEW_ROOT, fromSlug);
const fromTemplate = path.join(TEMPLATES_ROOT, fromBase);
const toPreview = path.join(PREVIEW_ROOT, slug);
const toTemplate = path.join(TEMPLATES_ROOT, newBase);

if (!existsSync(fromPreview)) fail(`Source preview missing: app/preview/${fromSlug}/`);
if (!existsSync(fromTemplate)) fail(`Source template missing: components/templates/${fromBase}/`);
if (existsSync(toPreview)) fail(`Already exists: app/preview/${slug}/`);
if (existsSync(toTemplate)) fail(`Already exists: components/templates/${newBase}/`);

console.log(`\n→ Cloning template ${fromSlug} → ${slug}\n`);
console.log(`  base: components/templates/${fromBase} → ${newBase}\n`);

cpSync(fromPreview, toPreview, { recursive: true });
console.log(`  ✓ app/preview/${slug}/`);
cpSync(fromTemplate, toTemplate, { recursive: true });
console.log(`  ✓ components/templates/${newBase}/`);

console.log(`\n→ Rewriting identifiers`);
const replacements = [
  // Long forms first (avoid partial overwrite of substrings).
  [`/preview/${fromSlug}`, `/preview/${slug}`],
  [`app/preview/${fromSlug}`, `app/preview/${slug}`],
  [`components/templates/${fromBase}`, `components/templates/${newBase}`],
  [`@/components/templates/${fromBase}`, `@/components/templates/${newBase}`],
  [fromSlug, slug],
  [fromBase, newBase],
];
rewriteTree(toPreview, replacements);
rewriteTree(toTemplate, replacements);
console.log(`  ✓ rewrote path constants in both trees`);

// Stub LayoutEntry append.
appendLayoutEntry({ slug, fromSlug, title });
console.log(`  ✓ appended LayoutEntry to lib/content/layouts.ts (review pullPaths!)`);

console.log(`\n→ Running typecheck (npx tsc --noEmit)\n`);
try {
  execSync("npx tsc --noEmit", { cwd: REPO, stdio: "inherit" });
} catch {
  console.error(`\n✖ typecheck failed. Review the rewrites above.`);
  process.exit(1);
}

console.log(`\n✓ Template ${slug} cloned.\n`);
console.log(`Next:`);
console.log(`  1. Walk app/preview/${slug}/ — replace business copy with your domain`);
console.log(`  2. Replace logos/colors in components/templates/${newBase}/shared/site-config.ts`);
console.log(`  3. Edit the LayoutEntry in lib/content/layouts.ts — set description, source, tags`);
console.log(`  4. Verify pullPaths array — it was copied from ${fromSlug} but file paths now use new slug`);
console.log(`  5. Run: node packages/cli/scripts/gen-manifest.mjs`);
console.log(`  6. npm run build (slow — verify everything renders)\n`);

// ─── helpers ───────────────────────────────────────────────────────────

function inferBase(templateSlug) {
  // Convention: app/preview/<slug>/ → components/templates/<slug-without--os>/
  // Try to find a matching dir under components/templates/.
  const noOs = templateSlug.replace(/-os$/, "");
  if (existsSync(path.join(TEMPLATES_ROOT, noOs))) return noOs;
  if (existsSync(path.join(TEMPLATES_ROOT, templateSlug))) return templateSlug;
  // Fall back to listing children that share a prefix.
  for (const name of readdirSync(TEMPLATES_ROOT)) {
    if (templateSlug.startsWith(name)) return name;
  }
  fail(`Could not infer base dir under components/templates/ for "${templateSlug}". Pass --base explicitly.`);
}

function rewriteTree(dir, pairs) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      rewriteTree(full, pairs);
      continue;
    }
    let body;
    try { body = readFileSync(full, "utf8"); } catch { continue; }
    const before = body;
    for (const [from, to] of pairs) body = body.replaceAll(from, to);
    if (body !== before) writeFileSync(full, body);
  }
}

function appendLayoutEntry({ slug, fromSlug, title }) {
  const src = readFileSync(LAYOUTS_TS, "utf8");
  if (src.includes(`slug: "${slug}"`)) {
    console.log(`  · layouts.ts already has "${slug}" — skipping append`);
    return;
  }
  const stub = `  {
    slug: "${slug}",
    title: ${JSON.stringify(title)},
    category: "website-template",
    description: "Cloned from ${fromSlug}. Replace this description.",
    source: "rahmanef63/resource-site",
    status: "draft",
    previewPath: "/preview/${slug}/public",
    pullPaths: [
      "app/preview/${slug}",
      "components/templates/${slug.replace(/-os$/, "")}",
    ],
    tags: ["draft", "cloned"],
  },
`;
  const closingIdx = src.lastIndexOf("];");
  if (closingIdx === -1) fail("Could not find closing `];` in lib/content/layouts.ts — append manually.");
  writeFileSync(LAYOUTS_TS, src.slice(0, closingIdx) + stub + src.slice(closingIdx));
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
