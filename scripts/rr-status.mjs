#!/usr/bin/env node
/**
 * KitabSync status — what's ready to UP-sync from which consumer.
 *
 * Wraps `npm run scan:consumers` and filters to the high-leverage rows
 * (up-needed, diverged, parse-error). Operator/agent dashboard before
 * picking the next `/rr-send <slug>` candidate.
 *
 * Usage:
 *   node scripts/rr-status.mjs                # ready-to-action rows
 *   node scripts/rr-status.mjs --all          # full scan output
 *   node scripts/rr-status.mjs --consumer X   # narrow to one consumer
 */

import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const all = args.includes("--all");
const consumerIdx = args.indexOf("--consumer");
const consumer = consumerIdx >= 0 ? args[consumerIdx + 1] : null;

const cliArgs = ["packages/cli/bin/scan-consumers.mjs"];
if (consumer) {
  cliArgs.push("--consumer", consumer);
} else {
  cliArgs.push("--all");
}

const r = spawnSync("node", cliArgs, { encoding: "utf8" });
if (r.status !== 0) {
  process.stderr.write(r.stderr);
  process.exit(r.status ?? 1);
}

if (all) {
  process.stdout.write(r.stdout);
  process.exit(0);
}

// Filter to action-needed rows.
const lines = r.stdout.split("\n");
const actionable = [];
let currentConsumer = null;
for (const line of lines) {
  const consumerMatch = line.match(/^▸ (\S+)/);
  if (consumerMatch) {
    currentConsumer = consumerMatch[1];
    continue;
  }
  if (/up-needed|diverged|parse error/.test(line)) {
    actionable.push({ consumer: currentConsumer, line: line.trimEnd() });
  }
}

if (!actionable.length) {
  console.log("✓ no UP-sync candidates and no parse errors — kitab + consumers all in-sync");
  process.exit(0);
}

console.log(`▸ ${actionable.length} actionable row(s):\n`);
let lastConsumer = null;
for (const { consumer, line } of actionable) {
  if (consumer !== lastConsumer) {
    console.log(`  [${consumer}]`);
    lastConsumer = consumer;
  }
  console.log(`    ${line}`);
}

console.log(`\nTip: /rr-send <slug> from inside the consumer repo to UP-sync.`);
