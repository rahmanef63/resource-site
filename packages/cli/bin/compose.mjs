// `rr compose <slug1> <slug2> ...` — run the Phase B compose solver.
//
//   rr compose doku-payment mdx-blog
//   rr compose doku-payment midtrans-payment --json
//   rr compose doku-payment --rr-path ./path/to/rr.json
//   rr compose doku-payment --no-deps
//
// Dispatched from bin/cli.js. Imports the pure solver from
// ../lib/compose-solver.mjs and only handles I/O + presentation.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import kleur from "kleur";

import { loadAllContracts, compose } from "../lib/compose-solver.mjs";

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

/**
 * Walk up from `start` looking for the directory that contains a `packages/`
 * folder + `package.json`. Falls back to cwd.
 */
function findRepoRoot(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (
      existsSync(path.join(dir, "packages")) &&
      existsSync(path.join(dir, "package.json"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

/**
 * Parse rr.json (if present) into a {@link RrJsonState}. Tolerates a
 * missing file by returning an empty state.
 *
 * Maps `rr.json#/auth.provider` to the solver's `auth` enum:
 *   "convex-auth" → "convex"
 *   "clerk" / "next-auth" / "none" → passthrough
 */
function readStateFromRr(rrPath) {
  if (!existsSync(rrPath)) return {};
  let raw;
  try {
    raw = JSON.parse(readFileSync(rrPath, "utf8"));
  } catch {
    return {};
  }
  const provider = raw?.auth?.provider;
  const authMap = {
    "convex-auth": "convex",
    clerk: "clerk",
    "next-auth": "next-auth",
    none: "none",
  };
  const auth = provider ? authMap[provider] ?? undefined : undefined;

  const slicesInstalled = [
    ...(raw?.slices ?? []).map((s) => s.slug).filter(Boolean),
    ...(raw?.features ?? []).map((f) => f.slug).filter(Boolean),
  ];

  return {
    auth,
    slicesInstalled,
    envExisting: Array.isArray(raw?.envExisting) ? raw.envExisting : [],
    rbacRolesExisting: Array.isArray(raw?.rbacRolesExisting)
      ? raw.rbacRolesExisting
      : [],
    convexTablesExisting: Array.isArray(raw?.convexTablesExisting)
      ? raw.convexTablesExisting
      : [],
  };
}

function hasBlocker(result) {
  return result.conflicts.some((c) => c.severity === "blocker");
}

function printHuman(result, { rrPath, repoRoot }) {
  const blocker = hasBlocker(result);
  const head = blocker
    ? kleur.red("✖ compose blocked")
    : kleur.green("✓ compose ok");
  console.log(
    `\n${head}  ${kleur.dim(`rr.json: ${path.relative(repoRoot, rrPath) || rrPath}`)}\n`,
  );

  console.log(kleur.bold("Proof"));
  if (result.proof.length === 0) {
    console.log("  " + kleur.dim("(no decisions — empty desired set)"));
  } else {
    for (const line of result.proof) {
      const colored = line.startsWith("+ ")
        ? kleur.green(line)
        : line.startsWith("- ")
          ? kleur.red(line)
          : line;
      console.log("  " + colored);
    }
  }

  if (result.accepted.length > 0) {
    console.log(`\n${kleur.bold("Accepted")} ${kleur.dim(`(${result.accepted.length})`)}`);
    for (const s of result.accepted) console.log("  " + kleur.cyan(s));
  }

  if (result.rejected.length > 0) {
    console.log(`\n${kleur.bold("Rejected")} ${kleur.dim(`(${result.rejected.length})`)}`);
    for (const r of result.rejected) {
      console.log("  " + kleur.red(r.slug));
      for (const reason of r.reasons) {
        console.log(
          "    " +
            kleur.dim(`[${reason.type}]`) +
            "  " +
            reason.detail,
        );
      }
    }
  }

  const warnings = result.conflicts.filter((c) => c.severity === "warning");
  if (warnings.length > 0) {
    console.log(`\n${kleur.bold("Warnings")} ${kleur.dim(`(${warnings.length})`)}`);
    for (const w of warnings) {
      console.log("  " + kleur.yellow(`[${w.type}]`) + "  " + w.detail);
    }
  }

  if (result.envMissing.length > 0) {
    console.log(`\n${kleur.bold("Env needed")}`);
    for (const e of result.envMissing) console.log("  " + kleur.yellow(e));
  }

  if (result.rbacToCreate.length > 0) {
    console.log(`\n${kleur.bold("RBAC to create")}`);
    for (const p of result.rbacToCreate) console.log("  " + kleur.yellow(p));
  }

  if (result.tablesAdded.length > 0) {
    console.log(`\n${kleur.bold("Tables added")}`);
    for (const t of result.tablesAdded) {
      console.log(
        "  " + kleur.cyan(t.slug) + ": " + kleur.dim(t.tables.join(", ")),
      );
    }
  }

  console.log(
    `\n${kleur.dim("appendix: pass --json for machine-readable output")}\n`,
  );
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

/**
 * Elevate every `warning`-level conflict to `blocker`, then re-derive the
 * accepted / rejected sets so the slice that triggered any warning gets
 * rejected. Used for `--strict` / CI gating.
 *
 * @param {import("../lib/compose-solver").ComposeResult} result
 * @returns {import("../lib/compose-solver").ComposeResult}
 */
function applyStrictMode(result) {
  const conflicts = result.conflicts.map((c) =>
    c.severity === "warning" ? { ...c, severity: "blocker" } : c,
  );
  const blockersBySlug = new Map();
  for (const c of conflicts) {
    if (c.severity !== "blocker") continue;
    const cur = blockersBySlug.get(c.slug) ?? [];
    cur.push(c);
    blockersBySlug.set(c.slug, cur);
  }
  const newRejected = [...result.rejected];
  const newAccepted = [];
  for (const slug of result.accepted) {
    const bl = blockersBySlug.get(slug);
    if (bl && bl.length > 0) {
      newRejected.push({ slug, reasons: bl, note: "strict-mode" });
    } else {
      newAccepted.push(slug);
    }
  }
  return { ...result, conflicts, accepted: newAccepted, rejected: newRejected };
}
