// Wave N+3 — `rr scan-consumers` CLI.
//
// Walks one or more consumer repos, reads each slice's `.kitab.json`, and
// diffs against the kitab's `frontend/slices/<slug>/slice.contract.ts`
// version. Prints a human ASCII table or `--json` for CI / MCP wiring.
//
// Usage:
//   npx rahman-resources scan-consumers --path /home/rahman/projects/CareerPack
//   npx rahman-resources scan-consumers --all
//   npx rahman-resources scan-consumers --consumer careerpack --json

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  walkConsumerSlices,
  diffSlice,
} from "../lib/consumer-manifest.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Resolve KITAB_ROOT in priority order:
 *   1. `process.env.KITAB_ROOT` — explicit operator override.
 *   2. `--kitab-root <path>` flag — same idea, per-invocation.
 *   3. Walk up from `process.cwd()` looking for the kitab sentinel
 *      (a directory containing both `frontend/slices/_templates` AND
 *      `packages/cli/bin/scan-consumers.mjs`).
 *   4. Fall back to `__dirname`-relative resolution — works in monorepo
 *      dev (`node packages/cli/bin/scan-consumers.mjs`) but fails when
 *      published + invoked via npx (cache path).
 *
 * If none resolve to a directory containing `frontend/slices/`, the CLI
 * exits with a helpful message instead of `ENOENT scandir`.
 */
function isKitabRoot(p) {
  return (
    existsSync(join(p, "frontend", "slices", "_templates")) &&
    existsSync(join(p, "packages", "cli", "bin", "scan-consumers.mjs"))
  );
}

function walkUpForKitab(start) {
  let cur = resolve(start);
  while (cur !== dirname(cur)) {
    if (isKitabRoot(cur)) return cur;
    cur = dirname(cur);
  }
  return null;
}

function resolveKitabRoot(flagValue) {
  if (process.env.KITAB_ROOT) return resolve(process.env.KITAB_ROOT);
  if (flagValue) return resolve(flagValue);
  const cwdMatch = walkUpForKitab(process.cwd());
  if (cwdMatch) return cwdMatch;
  const fallback = resolve(__dirname, "..", "..", "..");
  if (existsSync(join(fallback, "frontend", "slices"))) return fallback;
  return null;
}

/**
 * Default consumer registry. Edit when adding new consumers. Paths are
 * absolute on the operator workstation; CI invocation overrides via --path.
 */
export const DEFAULT_CONSUMERS = [
  { name: "careerpack", path: "/home/rahman/projects/CareerPack" },
  { name: "notion", path: "/home/rahman/projects/notion-page-clone" },
  { name: "rahmanef", path: "/home/rahman/projects/rahmanef.com" },
  { name: "content", path: "/home/rahman/projects/content-rahmanef-com" },
  { name: "superspace", path: "/home/rahman/projects/superspace" },
  { name: "cescadesigns", path: "/home/rahman/projects/cescadesigns" },
];

const COLOR = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  blue: "\x1b[34m",
};
function color(c, str, jsonMode) {
  return process.stdout.isTTY && !jsonMode ? `${COLOR[c]}${str}${COLOR.reset}` : str;
}

const ID_RE = /\bid\s*:\s*["']([a-z][a-z0-9-]*)["']/;
const VERSION_RE = /\bversion\s*:\s*["'](\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)["']/;

/**
 * Read all kitab contracts as {slug → version} via regex extraction.
 * Skips folders without a contract file (drift scanner separately reports
 * those — we only need version data here).
 */
async function readKitabContractVersions(kitabRoot) {
  const slicesDir = join(kitabRoot, "frontend", "slices");
  const entries = await readdir(slicesDir, { withFileTypes: true });
  const out = new Map();
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith("_")) continue;
    const contractPath = join(slicesDir, e.name, "slice.contract.ts");
    if (!existsSync(contractPath)) continue;
    try {
      const src = await readFile(contractPath, "utf8");
      const idMatch = src.match(ID_RE);
      const verMatch = src.match(VERSION_RE);
      if (!idMatch || !verMatch) continue;
      out.set(idMatch[1], verMatch[1]);
    } catch {
      // skip
    }
  }
  return out;
}

function parseArgs(argv) {
  const args = { paths: [], consumers: [], all: false, json: false, help: false, kitabRoot: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--path") {
      args.paths.push(argv[++i]);
    } else if (a === "--consumer") {
      args.consumers.push(argv[++i]);
    } else if (a === "--kitab-root") {
      args.kitabRoot = argv[++i];
    } else if (a === "--all") {
      args.all = true;
    } else if (a === "--json") {
      args.json = true;
    } else if (a === "-h" || a === "--help") {
      args.help = true;
    } else if (a.startsWith("--")) {
      throw new Error(`unknown flag: ${a}`);
    }
  }
  return args;
}

function printHelp() {
  console.log(`
Usage: rahman-resources scan-consumers [options]

Detect bidirectional sync state between the kitab and consumer repos by
reading each consumer slice's .kitab.json and diffing vs the kitab contract
version.

Options:
  --path <dir>            Scan one consumer repo at this path. Repeatable.
  --consumer <name>       Scan a registered consumer by name (see DEFAULT_CONSUMERS).
                          Repeatable.
  --kitab-root <dir>      Override kitab repo path. Default: walk up from cwd.
                          Equivalent to setting KITAB_ROOT env var.
  --all                   Scan every registered consumer.
  --json                  Machine-readable JSON output.
  -h, --help              Print this help.

Default if no flag given: --all.

Kitab root resolution priority:
  1. KITAB_ROOT env var
  2. --kitab-root flag
  3. Walk up from cwd looking for a kitab sentinel
  4. __dirname-relative (works in monorepo dev only)

Exit code:
  0  no UP-sync needed (DOWN-sync surfaced as info, not error)
  1  at least one consumer slice is up-needed/diverged AND policy != frozen
  2  malformed manifest in some consumer, OR kitab root not resolvable
`);
}

function resolveTargets(args) {
  const targets = [];
  for (const p of args.paths) {
    targets.push({ name: p, path: resolve(p) });
  }
  for (const cname of args.consumers) {
    const found = DEFAULT_CONSUMERS.find((c) => c.name === cname);
    if (!found) {
      throw new Error(`unknown consumer "${cname}" — registered: ${DEFAULT_CONSUMERS.map((c) => c.name).join(", ")}`);
    }
    targets.push({ name: found.name, path: found.path });
  }
  if (args.all || (targets.length === 0 && !args.help)) {
    for (const c of DEFAULT_CONSUMERS) {
      if (!targets.find((t) => t.path === c.path)) targets.push(c);
    }
  }
  return targets;
}

function verdictTone(v) {
  switch (v) {
    case "in-sync":
      return "green";
    case "up-needed":
      return "blue";
    case "down-needed":
      return "yellow";
    case "diverged":
      return "red";
    case "consumer-only":
      return "cyan";
    case "kitab-only":
      return "dim";
    default:
      return "reset";
  }
}

function pad(s, w) {
  const str = String(s);
  if (str.length >= w) return str;
  return str + " ".repeat(w - str.length);
}

async function scanOne(target, kitabVersions) {
  if (!existsSync(target.path)) {
    return { name: target.name, path: target.path, error: "path does not exist" };
  }
  const walked = await walkConsumerSlices(target.path);
  const diffs = [];
  const errors = [];
  const seen = new Set();
  for (const w of walked) {
    if (w.error) {
      errors.push({ dir: w.dir, message: w.error });
      continue;
    }
    const slug = w.manifest.kitabSlug;
    seen.add(slug);
    const kv = kitabVersions.get(slug) ?? null;
    diffs.push(diffSlice({ slug, manifest: w.manifest, kitabVersion: kv }));
  }
  // Surface kitab-only slices the consumer hasn't adopted at all.
  for (const [slug, version] of kitabVersions) {
    if (!seen.has(slug)) {
      diffs.push(diffSlice({ slug, manifest: null, kitabVersion: version }));
    }
  }
  diffs.sort((a, b) => a.slug.localeCompare(b.slug));
  return { name: target.name, path: target.path, diffs, errors };
}

export async function runScan(argv = []) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    console.error(color("red", err.message, false));
    process.exit(2);
  }
  if (args.help) {
    printHelp();
    process.exit(0);
  }
  const KITAB_ROOT = resolveKitabRoot(args.kitabRoot);
  if (!KITAB_ROOT) {
    console.error(
      color(
        "red",
        "could not locate kitab root. Set KITAB_ROOT env var, pass --kitab-root <path>, or run from within the kitab repo (or any subdir).",
        false,
      ),
    );
    process.exit(2);
  }
  const targets = resolveTargets(args);
  const kitabVersions = await readKitabContractVersions(KITAB_ROOT);
  const reports = await Promise.all(targets.map((t) => scanOne(t, kitabVersions)));

  let upNeeded = 0;
  let parseErrors = 0;
  for (const r of reports) {
    if (r.error) continue;
    parseErrors += r.errors?.length ?? 0;
    for (const d of r.diffs ?? []) {
      if (d.direction === "up-needed" || d.direction === "diverged") upNeeded++;
    }
  }

  if (args.json) {
    process.stdout.write(
      JSON.stringify(
        {
          kitabRoot: KITAB_ROOT,
          kitabContracts: kitabVersions.size,
          targets: reports,
          upNeeded,
          parseErrors,
        },
        null,
        2,
      ),
    );
    process.exit(upNeeded > 0 || parseErrors > 0 ? 1 : 0);
  }

  console.log(color("cyan", "\n== consumer sync scan ==", false));
  console.log(color("dim", `kitab root: ${KITAB_ROOT}  (${kitabVersions.size} contracts)`, false));
  void KITAB_ROOT;
  for (const r of reports) {
    console.log("");
    console.log(color("cyan", `▸ ${r.name}`, false), color("dim", r.path, false));
    if (r.error) {
      console.log("  " + color("red", `error: ${r.error}`, false));
      continue;
    }
    if (r.errors?.length) {
      for (const e of r.errors) {
        console.log("  " + color("red", `parse error @ ${e.dir}: ${e.message}`, false));
      }
    }
    if (r.diffs.length === 0) {
      console.log("  " + color("dim", "(no slices found)", false));
      continue;
    }
    const headers = ["slug", "kitab", "consumer", "verdict", "actions"];
    const rows = r.diffs.map((d) => [
      d.slug,
      d.kitabVersion ?? "—",
      d.consumerVersion ?? "—",
      d.direction,
      d.allowedActions.length ? d.allowedActions.join(",") : "—",
    ]);
    const widths = headers.map((h, i) =>
      Math.max(h.length, ...rows.map((r) => String(r[i]).length)),
    );
    console.log("  " + headers.map((h, i) => pad(h, widths[i])).join("  "));
    console.log("  " + widths.map((w) => "-".repeat(w)).join("  "));
    for (let i = 0; i < rows.length; i++) {
      const d = r.diffs[i];
      const tone = verdictTone(d.direction);
      const cells = rows[i].map((c, ci) => pad(c, widths[ci]));
      cells[3] = color(tone, cells[3], false);
      console.log("  " + cells.join("  "));
    }
  }
  console.log("");
  console.log(
    color("cyan", "Summary:", false),
    `${reports.length} consumer(s) · ` +
      color(upNeeded > 0 ? "blue" : "green", `${upNeeded} up-needed/diverged`, false) +
      ` · ` +
      color(parseErrors > 0 ? "red" : "green", `${parseErrors} parse error(s)`, false),
  );
  console.log("");
  process.exit(upNeeded > 0 || parseErrors > 0 ? 1 : 0);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === resolve(__filename);
if (isMain) {
  runScan(process.argv.slice(2)).catch((err) => {
    console.error(`scan-consumers crashed: ${err.stack || err}`);
    process.exit(2);
  });
}
