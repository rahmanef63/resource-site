#!/usr/bin/env node
/**
 * Aggregate validation runner — run before any rr push.
 *
 * Chains in the order they would fail in CI:
 *   1. typecheck      (catches contract DSL signature drift first)
 *   2. slices:check   (slice.json + audit-bp + gen registries + manifests + contracts)
 *   3. contracts:drift (DNA <-> contract <-> slice.json triple-check)
 *   4. forbidden:terms (cross-consumer leak gate)
 *   5. test           (vitest — slice-local + lib + packages/cli)
 *
 * Each step exits non-zero stops the chain (sequential).
 *
 * Usage:
 *   node scripts/validate-all.mjs            # full chain
 *   node scripts/validate-all.mjs --quick    # skip vitest (10s vs 30s)
 */

import { spawnSync } from "node:child_process";

const QUICK = process.argv.includes("--quick");

const steps = [
  // npm run typecheck (not bare npx tsc) — the script carries the heap
  // bump; a cold tsc on this repo OOMs the default Node heap.
  ["typecheck", ["npm", ["run", "typecheck", "--silent"]]],
  ["slices:check", ["npm", ["run", "slices:check", "--silent"]]],
  ["contracts:drift", ["npm", ["run", "contracts:drift", "--silent"]]],
  ["forbidden:terms", ["npm", ["run", "forbidden:terms", "--silent"]]],
];
if (!QUICK) steps.push(["test", ["npm", ["test", "--silent"]]]);

let failed = false;
for (const [label, [cmd, args]] of steps) {
  process.stdout.write(`▸ ${label.padEnd(20)} `);
  const t0 = Date.now();
  const r = spawnSync(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
  const ms = Date.now() - t0;
  if (r.status === 0) {
    console.log(`ok (${ms}ms)`);
  } else {
    failed = true;
    console.log(`FAIL (${ms}ms)`);
    process.stdout.write(r.stdout.toString());
    process.stderr.write(r.stderr.toString());
    break;
  }
}

if (failed) {
  console.log("\n✖ validation chain stopped");
  process.exit(1);
}

// Warn-only tail: ui-tree drift report (never fails the chain).
const drift = spawnSync("node", ["scripts/validation/report-ui-drift.mjs"], {
  stdio: ["ignore", "pipe", "pipe"],
});
process.stdout.write(drift.stdout.toString());

console.log(`\n✓ all validation gates green${QUICK ? " (quick — skipped tests)" : ""}`);
