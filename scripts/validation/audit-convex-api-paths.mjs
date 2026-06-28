#!/usr/bin/env node
// audit-convex-api-paths — every `internal.features.<path>.<fn>` /
// `api.features.<path>.<fn>` reference in convex/ must resolve to an existing
// convex/features/<path>.ts that exports <fn>.
//
// WHY: convex/** is excluded from the root tsc, and audit-convex-features bans
// the plural FILE (mutations.ts) but not a plural REFERENCE. A ref like
// `internal.features.ai.mutations.logUsage` (plural) when the file is
// mutation.ts (singular) resolves to `undefined` in the generated api object
// and throws "Cannot read properties of undefined" at RUNTIME — invisible to
// every other gate. This bug shipped 3× (ai / bookings / newsletter) before
// this check existed (2026-06-28 defect hunt). Catches plural-vs-singular,
// wrong dir/module names, and renamed/removed exports.
//
// SKIPS the consumer-side `.slices.*` namespace: seo's actions reference
// `api.slices.auth.me` / `internal.slices.seo.*` which only resolve after the
// CONSUMER composes the slices (Hard Rule 6) — not an rr-repo path.
//
// Run: node scripts/validation/audit-convex-api-paths.mjs   (wired into slices:check)

import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONVEX = path.join(ROOT, "convex");
const FEATURES = path.join(CONVEX, "features");

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "_generated" && e.name !== "node_modules") out.push(...walk(p));
    } else if (e.name.endsWith(".ts")) {
      out.push(p);
    }
  }
  return out;
}

// internal.features.X.Y.fn / api.features.X.fn — capture the dotted path after
// "features." (≥2 segments: at least <module>.<fn>).
const REF = /\b(?:internal|api)\.features\.([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+)/g;

const exportCache = new Map();
function exportsOf(file) {
  if (!exportCache.has(file)) {
    const src = readFileSync(file, "utf8");
    const set = new Set();
    for (const m of src.matchAll(/export\s+(?:const|let|function|async\s+function|class)\s+([A-Za-z0-9_]+)/g)) set.add(m[1]);
    for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
      for (const n of m[1].split(",")) {
        const t = n.trim().split(/\s+as\s+/).pop().trim();
        if (t) set.add(t);
      }
    }
    exportCache.set(file, set);
  }
  return exportCache.get(file);
}

const errors = [];
for (const f of walk(CONVEX)) {
  const rel = path.relative(ROOT, f);
  const src = readFileSync(f, "utf8");
  for (const m of src.matchAll(REF)) {
    const segs = m[1].split(".");
    const fn = segs[segs.length - 1];
    const modRel = segs.slice(0, -1).join("/");
    const modFile = path.join(FEATURES, modRel + ".ts");
    if (!existsSync(modFile)) {
      errors.push(`${rel}: ${m[0]} → convex/features/${modRel}.ts does not exist (plural mutations/queries vs singular file? wrong module path?)`);
    } else if (!exportsOf(modFile).has(fn)) {
      errors.push(`${rel}: ${m[0]} → convex/features/${modRel}.ts has no exported "${fn}"`);
    }
  }
}

if (errors.length) {
  console.error(`✖ audit-convex-api-paths: ${errors.length} unresolved convex api reference(s) — these throw at runtime (convex/** is excluded from tsc):`);
  for (const e of errors) console.error("  · " + e);
  process.exit(1);
}
console.log("✓ audit-convex-api-paths: all internal./api.features.* references resolve to an existing export");
