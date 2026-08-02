#!/usr/bin/env node
// validate-compose.mjs — verify that a set of slice slugs compose cleanly:
//   · all peers transitively present
//   · no SLICE_COMPAT conflicts between selected slices
//   · no duplicated convex tables across the selection
//
// Usage:
//   node scripts/validation/validate-compose.mjs <slice-slug>...
//   node scripts/validation/validate-compose.mjs --all-pairs    # CI matrix
//
// Reads packages/cli/lib/manifest.json (regenerate first if slices changed).

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const MANIFEST = JSON.parse(
  readFileSync(path.join(REPO, "packages/cli/lib/manifest.json"), "utf8"),
);
const SLICES = new Map((MANIFEST.slices ?? []).map((s) => [s.slug, s]));

// SLICE_COMPAT mirror — keep in sync with lib/build/compat.ts.
const SLICE_COMPAT = {
  "midtrans-payment": { conflicts: ["stripe-payment", "doku-payment"] },
};

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Usage: validate-compose.mjs <slice-slug>... | --all-pairs");
  process.exit(1);
}

const failures = [];

if (args.includes("--all-pairs")) {
  // Pairwise compose check across all known slices.
  const slugs = [...SLICES.keys()];
  for (let i = 0; i < slugs.length; i++) {
    for (let j = i + 1; j < slugs.length; j++) {
      const errs = validateSet([slugs[i], slugs[j]]);
      if (errs.length > 0) failures.push({ set: [slugs[i], slugs[j]], errors: errs });
    }
  }
} else {
  const errs = validateSet(args);
  if (errs.length > 0) failures.push({ set: args, errors: errs });
}

if (failures.length === 0) {
  console.log(`✓ compose check passed`);
  process.exit(0);
}

for (const f of failures) {
  console.error(`✖ [${f.set.join(" + ")}]`);
  for (const e of f.errors) console.error(`    · ${e}`);
}
process.exit(1);

// ───────────────────────────────────────────────────────────────────

function validateSet(slugs) {
  const errors = [];
  const present = new Set(slugs);

  // Peers transitively required
  for (const slug of slugs) {
    const s = SLICES.get(slug);
    if (!s) {
      errors.push(`unknown slug: ${slug}`);
      continue;
    }
    for (const peer of s.peers ?? []) {
      if (!present.has(peer.slug)) {
        errors.push(`${slug} requires peer ${peer.slug} ${peer.range} — missing from selection`);
      }
    }
  }

  // Conflicts
  for (const slug of slugs) {
    const compat = SLICE_COMPAT[slug];
    if (!compat?.conflicts) continue;
    for (const conflict of compat.conflicts) {
      if (present.has(conflict)) {
        errors.push(`${slug} conflicts with ${conflict}`);
      }
    }
  }

  // Convex table collision
  const tableOwners = new Map();
  for (const slug of slugs) {
    const s = SLICES.get(slug);
    if (!s) continue;
    for (const cp of s.convexPaths ?? []) {
      const schemaFile = path.join(REPO, cp, "schema.ts");
      if (!existsSync(schemaFile)) continue;
      const body = readFileSync(schemaFile, "utf8");
      const matches = [...body.matchAll(/^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*defineTable\(/gm)];
      for (const m of matches) {
        const tName = m[1];
        if (tableOwners.has(tName)) {
          errors.push(`convex table "${tName}" declared by both ${tableOwners.get(tName)} and ${slug}`);
        } else {
          tableOwners.set(tName, slug);
        }
      }
    }
  }
  return errors;
}
