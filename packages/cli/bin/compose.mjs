// `rr compose <slug1> <slug2> ...` — run the Phase B compose solver.
//
//   rr compose doku-payment mdx-blog
//   rr compose doku-payment midtrans-payment --json
//   rr compose doku-payment --rr-path ./path/to/rr.json
//   rr compose doku-payment --no-deps
//
// Dispatched from bin/cli.js. Imports the pure solver from
// ../lib/compose-solver.mjs and only handles I/O + presentation.
//
// Module split (kept ≤200 LOC each):
//   - compose-state.mjs  — rr.json reader + strict-mode + repo-root finder
//   - compose-print.mjs  — ASCII renderer for the human output mode

import path from "node:path";
import { fileURLToPath } from "node:url";

import kleur from "kleur";

import { loadAllContracts, compose } from "../lib/compose-solver.mjs";
import {
  findRepoRoot,
  readStateFromRr,
  hasBlocker,
  applyStrictMode,
} from "./compose-state.mjs";
import { printHuman } from "./compose-print.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Entry point invoked by cli.js with the post-`compose` argv tail.
 * @param {string[]} rest
 */
export async function runCompose(rest) {
  const { positional, flags } = parseFlags(rest);
  const slugs = positional.filter(Boolean);
  if (slugs.length === 0) {
    process.stderr.write(
      "Usage: rahman-resources compose <slug1> [<slug2> ...] [--json] [--rr-path <path>] [--no-deps] [--strict]\n",
    );
    process.exit(1);
  }
  const asJson = !!flags.json;
  const resolveDeps = !flags["no-deps"];
  const strict = !!flags.strict;

  // Locate rr.json (optional — solver tolerates an empty state).
  const rrPath = typeof flags["rr-path"] === "string"
    ? path.resolve(process.cwd(), flags["rr-path"])
    : path.resolve(process.cwd(), "rr.json");
  const state = readStateFromRr(rrPath);
  if (strict) state.allowUnknownSlices = false;

  // Walk up from packages/cli/bin/ to the kitab repo root.
  const repoRoot = findRepoRoot(__dirname);
  const contracts = await loadAllContracts(repoRoot);

  let result;
  try {
    result = compose({ state, desired: slugs, resolveDeps }, contracts);
  } catch (err) {
    process.stderr.write(kleur.red(`compose: ${err.message ?? err}\n`));
    process.exit(1);
  }

  // In strict mode, elevate ALL warnings → blockers and re-derive
  // accepted / rejected so CI gates flag every soft issue.
  if (strict) result = applyStrictMode(result);

  if (asJson) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    if (hasBlocker(result)) process.exit(1);
    return;
  }

  printHuman(result, { rrPath, repoRoot });
  if (hasBlocker(result)) process.exit(1);
}

/**
 * Programmatic helper used by `rr add` for the pre-flight gate.
 *
 * @param {string} slug
 * @param {string} repoRoot
 * @param {string} targetDir Directory holding rr.json (cwd by default).
 * @param {{ strict?: boolean }} [opts]
 * @returns {Promise<{ result: import("../lib/compose-solver").ComposeResult; rrPath: string }>}
 */
export async function preflight(slug, repoRoot, targetDir = process.cwd(), opts = {}) {
  const rrPath = path.join(targetDir, "rr.json");
  const state = readStateFromRr(rrPath);
  if (opts.strict) state.allowUnknownSlices = false;
  const contracts = await loadAllContracts(repoRoot);
  let result = compose({ state, desired: [slug], resolveDeps: true }, contracts);
  if (opts.strict) result = applyStrictMode(result);
  return { result, rrPath };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseFlags(rest) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = rest[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}
