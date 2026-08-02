#!/usr/bin/env node
// validate-structure.mjs — anti-spaghetti gate.
//
// Phase 6 of docs/REFACTOR-PLAN.md (2026-05-12). Enforces the rules in
// docs/STRUCTURE.md so future drift gets caught at CI, not by humans.
//
// Rules:
//   R1 No same slug in both `frontend/slices/<slug>/` AND
//      `template-base/frontend/slices/<slug>/`.
//   R2 Every `slug` in lib/content/slices.ts must point to a real path
//      on disk (slicePath or convexPaths[0]).
//   R3 Portable slices (`frontend/slices/<slug>/`) MUST NOT directly
//      `import` from `convex/react` (props-driven rule).
//   R4 No duplicate slugs across layouts ↔ slices.
//   R5 Recipes module must stay empty (Phase 3 migrated away from it).
//
// Run: node packages/cli/scripts/validate-structure.mjs [--json]
// Exits 1 on any rule violation.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadSlices, loadLayouts, loadRecipes } from "./parse-content.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../../..");

const args = process.argv.slice(2);
const asJson = args.includes("--json");

const slices = loadSlices();
const layouts = loadLayouts();
const recipes = loadRecipes();

const errors = [];

// R1 — dual-home detection.
const rootSliceDirs = listSubdirs(path.join(REPO, "frontend/slices"));
const tbSliceDirs = listSubdirs(path.join(REPO, "template-base/frontend/slices"));
for (const name of rootSliceDirs) {
  if (tbSliceDirs.includes(name) && !name.startsWith("_") && name !== "example") {
    errors.push({
      rule: "R1",
      msg: `slice "${name}" lives in BOTH frontend/slices/ and template-base/frontend/slices/`,
    });
  }
}

// R2 — slicePath/convexPaths existence.
for (const s of slices) {
  const checked = [];
  if (s.slicePath) checked.push(s.slicePath);
  if (s.convexPaths) checked.push(...s.convexPaths);
  if (checked.length === 0) continue; // registry-only entries allowed
  let anyExists = false;
  for (const p of checked) {
    if (existsSync(path.join(REPO, p))) {
      anyExists = true;
      break;
    }
  }
  if (!anyExists) {
    errors.push({
      rule: "R2",
      msg: `slice "${s.slug}" — none of [${checked.join(", ")}] exists on disk`,
    });
  }
}

// R3 — portable slice props-driven check.
const portableSlices = slices.filter((s) => s.slicePath?.startsWith("frontend/slices/"));
for (const s of portableSlices) {
  const dir = path.join(REPO, s.slicePath);
  if (!existsSync(dir)) continue;
  const bad = findConvexReactImports(dir);
  if (bad.length > 0) {
    errors.push({
      rule: "R3",
      msg: `portable slice "${s.slug}" imports convex/react at ${bad.map((b) => path.relative(REPO, b)).join(", ")} — use props-driven pattern`,
    });
  }
}

// R4 — slug uniqueness across layouts ↔ slices.
const seen = new Map();
for (const [kind, list] of [["layout", layouts], ["slice", slices]]) {
  for (const e of list) {
    const owner = seen.get(e.slug);
    if (owner && owner !== kind) {
      errors.push({
        rule: "R4",
        msg: `slug "${e.slug}" in both ${owner} and ${kind}`,
      });
    }
    seen.set(e.slug, kind);
  }
}

// R5 — recipes module must stay empty.
if (recipes.length > 0) {
  errors.push({
    rule: "R5",
    msg: `lib/content/recipes.ts has ${recipes.length} entries — Phase 3 migrated away from recipes; add new entries to slices.ts instead`,
  });
}

if (asJson) {
  console.log(JSON.stringify({ errors }, null, 2));
} else {
  if (errors.length === 0) {
    console.log("✓ structure check passed (R1-R5)");
  } else {
    console.error(`${errors.length} violation(s):`);
    for (const e of errors) console.error(`  ✖ [${e.rule}] ${e.msg}`);
  }
}

process.exit(errors.length > 0 ? 1 : 0);

// --- helpers ---

function listSubdirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((n) => statSync(path.join(dir, n)).isDirectory());
}

function findConvexReactImports(dir) {
  const out = [];
  walk(dir);
  return out;
  function walk(d) {
    for (const name of readdirSync(d)) {
      const full = path.join(d, name);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (/\.(tsx?|jsx?)$/.test(name)) {
        const src = readFileSync(full, "utf8");
        // Match `import ... from "convex/react"` (string or template literal).
        // Skip JSDoc/example references inside /* */ or // — naive: only flag
        // import statements at line start.
        for (const line of src.split("\n")) {
          if (/^\s*import\s.+\sfrom\s+['"]convex\/react['"]/.test(line)) {
            out.push(full);
            break;
          }
        }
      }
    }
  }
}
