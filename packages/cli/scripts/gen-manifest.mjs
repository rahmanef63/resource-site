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
import { readFileSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../lib/manifest.json");
const STRICT = process.argv.includes("--strict");

const warnings = [];
const errors = [];

// Superseded slugs (merged into landing-sections, UX wave U3) leave the
// manifest entries and resolve via the aliases map instead.
const ALIASES = JSON.parse(
  readFileSync(path.resolve(__dirname, "../../../lib/content/slice-aliases.json"), "utf8"),
);

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

const features = loadFeatures().filter((f) => !ALIASES[f.slug]).map((f) => {
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

// slice.json is the SSOT (audit:slices gates to it). The catalog (slices.ts)
// version is display-only and lags — prefer slice.json so the distributed
// manifest never ships stale `version`, and so `variants` (shadcn-style) is
// carried through for the CLI to resolve `add <slug> <variant>`.
function readSliceJson(slug) {
  for (const base of ["frontend/slices", "template-base/frontend/slices"]) {
    const p = path.resolve(__dirname, `../../../${base}/${slug}/slice.json`);
    if (existsSync(p)) {
      try { return JSON.parse(readFileSync(p, "utf8")); } catch { return null; }
    }
  }
  return null;
}

const slices = loadSlices().filter((s) => !ALIASES[s.slug]).map((s) => {
  // Derive `kind` if not explicit. backend = has convex, no slicePath bits;
  // ui = slicePath present, convexPaths empty; full = both.
  const sj = readSliceJson(s.slug);
  const hasFrontend = !!s.slicePath;
  const hasBackend = (s.convexPaths ?? []).length > 0;
  const inferred = hasFrontend && hasBackend ? "full" : hasBackend ? "backend" : "ui";
  return {
    slug: s.slug,
    title: s.title,
    category: s.category,
    kind: s.kind ?? inferred,
    version: sj?.version ?? s.version,
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
    // Emit only when present → manifest bytes unchanged for non-variant slices.
    ...(sj?.variants ? { variants: sj.variants } : {}),
  };
});

// Slug uniqueness across kinds (CLI dispatches by slug). After Phase 3
// of docs/REFACTOR-PLAN.md (2026-05-12): recipes.ts emptied, features
// derived from slices — feature↔slice slug overlap is now expected
// (same source), so they share an entry. Strict uniqueness across
// layout / slice. Features skip the check (derived view).
const allSlugs = new Map();
for (const [kind, list] of [["layout", layouts], ["recipe", recipes], ["slice", slices]]) {
  for (const e of list) {
    const owner = allSlugs.get(e.slug);
    if (owner) {
      errors.push(
        `Duplicate slug "${e.slug}" in ${kind} — also in ${owner}`,
      );
    }
    allSlugs.set(e.slug, kind);
  }
}

// No `generatedAt` — a timestamp here rewrites the committed manifest on every
// run, producing empty diffs + noisy blame even when nothing changed.
const manifest = {
  version: 2,
  repo: "rahmanef63/resource-site",
  branch: "main",
  aliases: ALIASES,
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
