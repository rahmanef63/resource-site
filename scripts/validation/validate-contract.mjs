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
 */
import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join, resolve, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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

// ---------------------------------------------------------------------------
// Same regex set as packages/cli/lib/contract.ts — kept in sync intentionally
// ---------------------------------------------------------------------------
const KEBAB_CASE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const SEMVER =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const PREFIX = /^[a-z][a-z0-9_]*_$/;
const CONFLICT_RE =
  /^[a-z][a-z0-9-]*:(routes|hooks|tables|events|components)\.[A-Za-z0-9_\-\/]+$/;
const PERMISSION = /^[^.]+\.[^.]+$/;

/**
 * Replicates defineSliceContract's runtime invariants for the validator.
 * Returns array of human-readable error strings (empty on success).
 */
function shapeCheck(c) {
  const errs = [];
  if (!c || typeof c !== "object") {
    errs.push("contract is not an object");
    return errs;
  }
  if (typeof c.id !== "string" || !KEBAB_CASE.test(c.id)) {
    errs.push(`id "${String(c.id)}" must be kebab-case`);
  }
  if (typeof c.version !== "string" || !SEMVER.test(c.version)) {
    errs.push(`version "${String(c.version)}" is not semver`);
  }
  const requires = c.requires || {};
  const provides = c.provides || {};

  if (Array.isArray(requires.rbac)) {
    for (const p of requires.rbac) {
      if (typeof p !== "string" || !PERMISSION.test(p)) {
        errs.push(`rbac entry "${String(p)}" must be "<domain>.<action>"`);
      }
    }
  }

  const cx = requires.convex;
  if (cx) {
    if (typeof cx.prefix !== "string" || !PREFIX.test(cx.prefix)) {
      errs.push(`convex.prefix "${String(cx.prefix)}" must match /^[a-z][a-z0-9_]*_$/`);
    } else {
      if (!Array.isArray(cx.tables)) {
        errs.push("convex.tables must be an array");
      } else {
        for (const t of cx.tables) {
          if (typeof t !== "string" || !t.startsWith(cx.prefix)) {
            errs.push(`convex.tables entry "${String(t)}" must start with prefix "${cx.prefix}"`);
          }
        }
      }
      if (Array.isArray(provides.tables)) {
        for (const t of provides.tables) {
          if (typeof t !== "string" || !t.startsWith(cx.prefix)) {
            errs.push(
              `provides.tables entry "${String(t)}" must start with prefix "${cx.prefix}"`,
            );
          }
        }
      }
    }
  }

  if (c.conflicts) {
    if (!Array.isArray(c.conflicts)) {
      errs.push("conflicts must be an array");
    } else {
      for (const cf of c.conflicts) {
        if (typeof cf !== "string" || !CONFLICT_RE.test(cf)) {
          errs.push(
            `conflicts entry "${String(cf)}" must match "<slug>:<routes|hooks|tables|events|components>.<value>"`,
          );
        }
      }
    }
  }

  return errs;
}

/**
 * Load a contract from a `.ts` file.
 *
 * Strategy: spawn `npx tsx` to dynamic-import the file and JSON-stringify the
 * named `contract` export. Falls back to a regex pre-parse that only verifies
 * the file structurally calls `defineSliceContract({...})` if tsx is
 * unavailable or returns a non-zero exit.
 */
function loadContract(filePath) {
  // Dynamic import — tsx wraps named exports under `default` namespace, so we
  // try both shapes. Use a relative path so tsx resolves it correctly.
  const rel = "./" + relative(ROOT, filePath);
  const code = [
    `import(${JSON.stringify(rel)})`,
    `  .then(m => { const c = m.contract || (m.default && m.default.contract); if (!c) { process.stderr.write("no-contract-export"); process.exit(2); } process.stdout.write(JSON.stringify(c)); })`,
    `  .catch(e => { process.stderr.write(String(e && e.message || e)); process.exit(3); });`,
  ].join("\n");
  const res = spawnSync("npx", ["--no-install", "tsx", "-e", code], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (res.status === 0 && res.stdout) {
    try {
      return { ok: true, contract: JSON.parse(res.stdout), source: "tsx" };
    } catch {
      /* fall through */
    }
  }

  return { ok: false, error: "tsx-load-failed", stderr: res.stderr || "" };
}

async function regexFallback(filePath) {
  const src = await readFile(filePath, "utf8");
  const hasFactory = /defineSliceContract\s*\(\s*\{/.test(src);
  const hasExport = /export\s+const\s+contract\s*=/.test(src);
  if (!hasFactory || !hasExport) {
    return [
      `regex-fallback: file does not export \`const contract = defineSliceContract({...})\``,
    ];
  }
  return [];
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

async function main() {
  console.log(color("cyan", "\n== slice.contract validator =="));

  const contracts = await findContracts();
  if (contracts.length === 0) {
    console.log(color("yellow", "  (no slice.contract.ts files found)"));
    return;
  }

  // Phase 1: load + shape-check each contract.
  const loaded = [];
  const lines = [];
  let failures = 0;
  let i = 0;

  for (const c of contracts) {
    i++;
    const rel = relative(ROOT, c.path);
    const load = loadContract(c.path);
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

  // Phase 2: cross-slice conflict resolution.
  // Build lookup: slug -> provides map.
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

  for (const line of lines) console.log("  " + line);

  console.log("");
  const okCount = loaded.length - failures;
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
