#!/usr/bin/env node
// Regenerate lib/manifest.json from site/lib/content/{layouts,recipes,features}.ts.
// Overwrites the previous manifest.
//
// Run: node packages/cli/scripts/gen-manifest.mjs [--strict]

import { existsSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SITE,
  loadLayouts,
  loadRecipes,
  loadFeatures,
  loadSlices,
  parseNpmPackages,
} from "./parse-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../lib/manifest.json");
const STRICT = process.argv.includes("--strict");

const warnings = [];
const errors = [];

function deriveLayoutPullPaths(l) {
  if (l.pullPaths && l.pullPaths.length > 0) return l.pullPaths;
  const previewPath = `app/preview/${l.slug}`;
  if (existsSync(path.join(SITE, previewPath))) return [previewPath];
  return [`cookbook/layouts/${l.slug}`];
}

function checkPath(slug, p, kind) {
  const abs = path.join(SITE, p);
  const exists = existsSync(abs);
  if (!exists) {
    const msg = `[${kind}/${slug}] missing on disk: ${p}`;
    (STRICT ? errors : warnings).push(msg);
  }
  return exists;
}

const layouts = loadLayouts().map((l) => {
  const isComingSoon = l.status === "coming-soon";
  const pullPaths = isComingSoon ? [] : deriveLayoutPullPaths(l);
  const validPaths = pullPaths.filter((p) => checkPath(l.slug, p, "layout"));
  return {
    slug: l.slug,
    title: l.title,
    category: l.category,
    status: l.status,
    description: l.description,
    source: l.source,
    repoPath: l.repoPath,
    pullPaths: validPaths,
    files: l.files ?? [],
    dependencies: l.dependencies ?? [],
    shadcnComponents: l.shadcnComponents ?? [],
    agentRecipe: l.agentRecipe ?? "",
    tags: l.tags ?? [],
    primaryFile: l.primaryFile,
    docsUrl: undefined,
  };
});

const recipes = loadRecipes().map((r) => ({
  slug: r.slug,
  title: r.title,
  description: r.description,
  source: r.source,
  files: r.files ?? [],
  exampleCode: r.exampleCode ?? "",
  agentRecipe: r.agentRecipe ?? "",
  tags: r.tags ?? [],
}));

const features = loadFeatures().map((f) => {
  const pkgs = parseNpmPackages(f.install);
  return {
    slug: f.slug,
    title: f.title,
    category: f.category,
    description: f.description,
    source: f.source,
    docsUrl: f.docsUrl,
    install: f.install,
    npmPackages: pkgs,
    exampleCode: f.exampleCode ?? "",
    agentRecipe: f.agentRecipe ?? "",
    tags: f.tags ?? [],
  };
});

const slices = loadSlices().map((s) => ({
  slug: s.slug,
  title: s.title,
  category: s.category,
  version: s.version,
  description: s.description,
  source: s.source ?? "",
  slicePath: s.slicePath,
  convexPaths: s.convexPaths ?? [],
  npm: s.npm ?? [],
  shadcn: s.shadcn ?? [],
  env: s.env ?? [],
  peers: s.peers ?? [],
  providers: s.providers ?? [],
  tags: s.tags ?? [],
  agentRecipe: s.agentRecipe ?? "",
}));

// Slug uniqueness across kinds (CLI dispatches by slug). NOTE: features and
// slices CAN share a slug — slice supersedes feature (deeper tier-3 rep of
// the same concept). CLI add-flow tries slice first, falls back to feature.
const allSlugs = new Map();
for (const [kind, list] of [["layout", layouts], ["recipe", recipes], ["feature", features], ["slice", slices]]) {
  for (const e of list) {
    const owner = allSlugs.get(e.slug);
    if (owner) {
      const allowed = (owner === "feature" && kind === "slice") || (owner === "slice" && kind === "feature");
      if (!allowed) {
        errors.push(
          `Duplicate slug "${e.slug}" in ${kind} — also in ${owner}`,
        );
      }
    }
    allSlugs.set(e.slug, kind);
  }
}

const manifest = {
  version: 2,
  generatedAt: new Date().toISOString(),
  repo: "rahmanef63/resource-site",
  branch: "main",
  layouts,
  recipes,
  features,
  slices,
};

writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n");

console.log(
  `Wrote ${layouts.length} layouts + ${recipes.length} recipes + ${features.length} features + ${slices.length} slices → ${path.relative(process.cwd(), OUT)}`,
);

if (warnings.length > 0) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}
if (errors.length > 0) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  ✖ ${e}`);
  process.exit(1);
}
