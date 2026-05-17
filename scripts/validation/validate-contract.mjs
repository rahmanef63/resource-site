#!/usr/bin/env node
/**
 * Validate every slice contract — `slice.contract.ts` — under
 *   frontend/slices/<slug>/slice.contract.ts
 *   template-base/frontend/slices/<slug>/slice.contract.ts
 *
 * Phase-A "Slice Composition Compiler" validator. Runs the same shape checks
 * as `defineSliceContract()` (kebab-case id, semver, convex prefix invariants,
 * conflict-path format) PLUS a cross-slice check that surfaces a P0 finding
 * when one slice declares `conflicts: ["<other>:<key>.<value>"]` AND the other
 * slice's `provides.<key>` contains `<value>`.
 *
 * Output mirrors TAP-ish style used by sibling validators:
 *
 *   ok 1 - frontend/slices/convex-auth/slice.contract.ts
 *   not ok 2 - frontend/slices/doku-payment/slice.contract.ts: conflict with midtrans-payment on tables.paymentOrders
 *
 * Usage:
 *   node scripts/validation/validate-contract.mjs
 *   node scripts/validation/validate-contract.mjs --check    # exit 1 on any failure
 *
 * Shape checks + tsx loader live in validate-contract-shape.mjs (kept ≤200 LOC).
 */
import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  shapeCheck,
  loadContract,
  regexFallback,
} from "./validate-contract-shape.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");

const SLICE_ROOTS = [
  join(ROOT, "frontend", "slices"),
  join(ROOT, "template-base", "frontend", "slices"),
];

const isCheckMode = process.argv.includes("--check");

const COLOR = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function color(c, str) {
  return process.stdout.isTTY ? `${COLOR[c]}${str}${COLOR.reset}` : str;
}

async function findContracts() {
  const found = [];
  for (const root of SLICE_ROOTS) {
    if (!existsSync(root)) continue;
    const entries = await readdir(root, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith("_")) continue;
      const filePath = join(root, entry.name, "slice.contract.ts");
      if (existsSync(filePath)) {
        found.push({ slug: entry.name, path: filePath });
      }
    }
  }
  return found;
}

async function loadAndShapeCheck(contracts) {
  const loaded = [];
  const lines = [];
  let failures = 0;
  let i = 0;

  for (const c of contracts) {
    i++;
    const rel = relative(ROOT, c.path);
    const load = loadContract(c.path, ROOT);
    if (!load.ok) {
      // try regex fallback
      const fallbackErrs = await regexFallback(c.path);
      if (fallbackErrs.length === 0) {
        lines.push(`ok ${i} - ${rel} ${color("dim", "(regex-fallback)")}`);
        loaded.push({ slug: c.slug, path: c.path, contract: null, skipped: true });
      } else {
        lines.push(`not ok ${i} - ${rel}: ${fallbackErrs.join("; ")}`);
        if (load.stderr) {
          lines.push(`  ${color("dim", load.stderr.trim().split("\n").slice(-3).join(" | "))}`);
        }
        failures++;
      }
      continue;
    }
    const errs = shapeCheck(load.contract);
    if (errs.length === 0) {
      lines.push(`ok ${i} - ${rel}`);
      loaded.push({ slug: c.slug, path: c.path, contract: load.contract, skipped: false });
    } else {
      lines.push(`not ok ${i} - ${rel}: ${errs.join("; ")}`);
      failures++;
    }
  }
  return { loaded, lines, failures, lastIdx: i };
}

function crossSliceCheck(loaded, lines, startIdx) {
  let i = startIdx;
  let failures = 0;
  const byId = new Map();
  for (const entry of loaded) {
    if (entry.skipped || !entry.contract) continue;
    byId.set(entry.contract.id, entry.contract);
  }

  for (const entry of loaded) {
    if (entry.skipped || !entry.contract) continue;
    const c = entry.contract;
    if (!Array.isArray(c.conflicts) || c.conflicts.length === 0) continue;
    for (const cf of c.conflicts) {
      // Format: <slug>:<key>.<value>  (regex-validated already)
      const colon = cf.indexOf(":");
      const dot = cf.indexOf(".", colon);
      if (colon < 0 || dot < 0) continue;
      const otherSlug = cf.slice(0, colon);
      const key = cf.slice(colon + 1, dot);
      const value = cf.slice(dot + 1);

      const other = byId.get(otherSlug);
      if (!other) continue; // other slice not present — collision is dormant
      const provided = other.provides?.[key];
      if (Array.isArray(provided) && provided.includes(value)) {
        i++;
        const rel = relative(ROOT, entry.path);
        lines.push(
          `not ok ${i} - ${rel}: conflict with ${otherSlug} on ${key}.${value}`,
        );
        failures++;
      }
    }
  }
  return failures;
}

async function main() {
  console.log(color("cyan", "\n== slice.contract validator =="));

  const contracts = await findContracts();
  if (contracts.length === 0) {
    console.log(color("yellow", "  (no slice.contract.ts files found)"));
    return;
  }

  // Phase 1: load + shape-check each contract.
  const { loaded, lines, failures: shapeFailures, lastIdx } = await loadAndShapeCheck(contracts);

  // Phase 2: cross-slice conflict resolution.
  const crossFailures = crossSliceCheck(loaded, lines, lastIdx);
  const failures = shapeFailures + crossFailures;

  for (const line of lines) console.log("  " + line);

  console.log("");
  const okCount = loaded.length - shapeFailures;
  console.log(
    `${color("cyan", "Summary:")} ${color("green", `${okCount} ok`)} · ${color("red", `${failures} failures`)} · ${contracts.length} contract(s) scanned`,
  );

  if (isCheckMode && failures > 0) {
    console.error(color("red", "\nContract validator failed in --check mode."));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(color("red", `Contract validator crashed: ${err.stack || err}`));
  process.exit(1);
});
