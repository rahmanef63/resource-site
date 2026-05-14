// `rr migrate <slug> --from <v1> --to <v2>` — Phase E CLI dispatcher.
//
// Loads two versions of a slice contract (HEAD + a historic ref), runs
// the diff + planner, and either prints an ASCII summary or writes the
// proposed `convex/migrations/*.ts` artifacts into the cwd.
//
// Flags:
//   --from <semver>         Required. Source version to diff against.
//   --to <semver>           Optional. Defaults to the contract's current `version`.
//   --json                  Emit the MigrationPlan as JSON instead of ASCII.
//   --write-files           Write convexMigration artifacts into ./convex/migrations/.
//   --force-overwrite       Overwrite existing files in convex/migrations/.
//   --rr-path <path>        Override the consumer rr.json location (used to
//                           anchor the convex/migrations write target).
//   --repo-root <path>      Override the kitab repo root discovery.
//
// Side-effects (only with --write-files):
//   - Writes ./convex/migrations/<step-id>.ts
//   - Appends a DNA lineage entry with transforms ["migration-applied", ...].

import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import kleur from "kleur";

import { diffContracts, planMigration } from "../lib/migration-plan.mjs";
import { appendLineage } from "../lib/dna.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Entry point invoked by cli.js with the post-`migrate` argv tail.
 * @param {string[]} rest
 */
export async function runMigrate(rest) {
  const { positional, flags } = parseFlags(rest);
  const slug = positional[0];
  if (!slug) {
    process.stderr.write(
      kleur.red(
        "Usage: rahman-resources migrate <slug> --from <v1> [--to <v2>] [--json] [--write-files] [--force-overwrite]\n",
      ),
    );
    process.exit(1);
  }
  const fromVersion = typeof flags.from === "string" ? flags.from : null;
  if (!fromVersion) {
    process.stderr.write(
      kleur.red("migrate: --from <version> is required.\n"),
    );
    process.exit(1);
  }
  const explicitTo = typeof flags.to === "string" ? flags.to : null;
  const asJson = !!flags.json;
  const writeFiles = !!flags["write-files"];
  const forceOverwrite = !!flags["force-overwrite"];

  const repoRoot =
    typeof flags["repo-root"] === "string"
      ? path.resolve(process.cwd(), flags["repo-root"])
      : findRepoRoot(__dirname);

  const cwd = process.cwd();

  // 1) Load contracts.
  const toContract = loadCurrentContract(repoRoot, slug);
  if (!toContract) {
    process.stderr.write(
      kleur.red(
        `migrate: cannot load current contract for "${slug}". ` +
          `Expected frontend/slices/${slug}/slice.contract.ts or template-base/frontend/slices/${slug}/slice.contract.ts.\n`,
      ),
    );
    process.exit(1);
  }
  if (explicitTo && toContract.version !== explicitTo) {
    // The current on-disk contract isn't the requested target — bail rather
    // than silently diff against the wrong file.
    process.stderr.write(
      kleur.red(
        `migrate: on-disk contract is v${toContract.version}, --to v${explicitTo} requested. ` +
          `Bump the contract first or omit --to.\n`,
      ),
    );
    process.exit(1);
  }

  const fromContract = loadHistoricContract(repoRoot, slug, fromVersion);
  if (!fromContract) {
    process.stderr.write(
      kleur.red(
        `migrate: cannot load contract for "${slug}" at version ${fromVersion}. ` +
          `Tried tags v${fromVersion}, ${fromVersion}, ${slug}-v${fromVersion}, and a best-effort log scan.\n`,
      ),
    );
    process.exit(1);
  }

  // 2) Diff + plan.
  const diff = diffContracts(fromContract, toContract);
  const plan = planMigration(diff);

  // 3) Emit.
  if (asJson) {
    process.stdout.write(JSON.stringify(plan, null, 2) + "\n");
  } else {
    printPlan(plan);
  }

  // 4) Optional write.
  if (writeFiles) {
    const writeDir = path.join(cwd, "convex", "migrations");
    mkdirSync(writeDir, { recursive: true });
    const writtenIds = [];
    for (const step of plan.steps) {
      const body = step.artifacts?.convexMigration;
      if (!body) continue;
      const file = path.join(writeDir, `${step.id}.ts`);
      if (existsSync(file) && !forceOverwrite) {
        process.stderr.write(
          kleur.red(
            `migrate: ${path.relative(cwd, file)} already exists. Pass --force-overwrite to replace.\n`,
          ),
        );
        process.exit(1);
      }
      writeFileSync(file, body + "\n");
      writtenIds.push(step.id);
      if (!asJson) {
        process.stdout.write(
          `  ${kleur.green("+")} ${path.relative(cwd, file)}\n`,
        );
      }
    }
    // 5) Append DNA lineage.
    if (writtenIds.length > 0) {
      try {
        appendLineage(slug, {
          from: `contract:${slug}@${plan.fromVersion}`,
          to: `contract:${slug}@${plan.toVersion}`,
          at: new Date().toISOString(),
          transforms: ["migration-applied", ...writtenIds],
        });
        if (!asJson) {
          process.stdout.write(
            kleur.dim(
              `  lineage: appended "migration-applied" entry to .kitab/lineage/${slug}.dna.json\n`,
            ),
          );
        }
      } catch (err) {
        process.stderr.write(
          kleur.yellow(
            `  ⚠ lineage append failed (${err.message ?? err}). Files were still written.\n`,
          ),
        );
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Contract loading
// ---------------------------------------------------------------------------

const SLICE_ROOTS = [
  ["frontend", "slices"],
  ["template-base", "frontend", "slices"],
];

function resolveContractPath(repoRoot, slug) {
  for (const segs of SLICE_ROOTS) {
    const p = path.join(repoRoot, ...segs, slug, "slice.contract.ts");
    if (existsSync(p)) return p;
  }
  return null;
}

function resolveContractRelPath(repoRoot, slug) {
  for (const segs of SLICE_ROOTS) {
    const rel = [...segs, slug, "slice.contract.ts"].join("/");
    if (existsSync(path.join(repoRoot, rel))) return rel;
  }
  return null;
}

function loadCurrentContract(repoRoot, slug) {
  const p = resolveContractPath(repoRoot, slug);
  if (!p) return null;
  return evalContract(repoRoot, p, null);
}

/**
 * Resolve the contract at a historic version. Strategy:
 *   1. Try git tags `v<ver>`, `<ver>`, `<slug>-v<ver>` against the contract file.
 *   2. If none have the right version, scan recent commits touching the file
 *      and pick the most recent one whose contract.version === fromVersion.
 */
function loadHistoricContract(repoRoot, slug, fromVersion) {
  const rel = resolveContractRelPath(repoRoot, slug);
  if (!rel) return null;

  const candidates = [`v${fromVersion}`, fromVersion, `${slug}-v${fromVersion}`];
  for (const ref of candidates) {
    const text = gitShowFile(repoRoot, ref, rel);
    if (text) {
      const c = evalContract(repoRoot, null, text);
      if (c && c.version === fromVersion) return c;
    }
  }

  // Fallback: scan commit history for the file.
  const log = spawnSync("git", ["log", "--format=%H", "--", rel], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (log.status === 0 && log.stdout) {
    const hashes = log.stdout.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const sha of hashes) {
      const text = gitShowFile(repoRoot, sha, rel);
      if (!text) continue;
      const c = evalContract(repoRoot, null, text);
      if (c && c.version === fromVersion) return c;
    }
  }
  return null;
}

function gitShowFile(repoRoot, ref, relPath) {
  const res = spawnSync("git", ["show", `${ref}:${relPath}`], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (res.status === 0 && typeof res.stdout === "string") return res.stdout;
  return null;
}

/**
 * Eval a contract file by spawning `npx tsx` and reading the JSON output.
 * Pass `filePath` (absolute) for the on-disk version OR `inlineText` for a
 * historic version pulled via git show.
 */
function evalContract(repoRoot, filePath, inlineText) {
  if (filePath) {
    const rel = "./" + path.relative(repoRoot, filePath);
    const code = [
      `import(${JSON.stringify(rel)})`,
      `  .then(m => { const c = m.contract || (m.default && m.default.contract); if (!c) { process.exit(2); } process.stdout.write(JSON.stringify(c)); })`,
      `  .catch((e) => { process.stderr.write(String(e && e.stack || e)); process.exit(3); });`,
    ].join("\n");
    const res = spawnSync("npx", ["--no-install", "tsx", "-e", code], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    if (res.status === 0 && res.stdout) {
      try {
        return JSON.parse(res.stdout);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Inline mode: write to a temp file under the kitab root (so its tsconfig +
  // path aliases resolve) and eval. We use a `.migration-tmp/` folder so the
  // temp file is colocated with packages/ but easy to ignore.
  if (typeof inlineText !== "string") return null;
  const tmpDir = path.join(repoRoot, ".migration-tmp");
  mkdirSync(tmpDir, { recursive: true });
  const tmpFile = path.join(
    tmpDir,
    `contract-${Date.now()}-${Math.random().toString(36).slice(2)}.ts`,
  );
  try {
    // Rewrite the import path back to the absolute kitab `contract` module so
    // `../../../packages/cli/lib/contract` (from a historic file pulled via
    // git show) keeps resolving after we move it to a different directory.
    const adjusted = adjustContractImport(inlineText, repoRoot, tmpDir);
    writeFileSync(tmpFile, adjusted);
    return evalContract(repoRoot, tmpFile, null);
  } finally {
    try {
      if (existsSync(tmpFile)) unlinkSync(tmpFile);
    } catch {
      // ignore
    }
  }
}

/**
 * Replace any `from "..contract"` import in the contract body with an
 * absolute path so the temp-file copy still resolves the same module.
 */
function adjustContractImport(text, repoRoot, tmpDir) {
  const contractMod = path.join(repoRoot, "packages", "cli", "lib", "contract");
  const relFromTmp = path
    .relative(tmpDir, contractMod)
    .split(path.sep)
    .join("/");
  // Match imports ending in /contract or /contract.ts (with or without .ts).
  return text.replace(
    /from\s+["'][^"']*\/contract(?:\.ts)?["']/g,
    `from "${relFromTmp}"`,
  );
}

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

function printPlan(plan, _ctx) {
  const head = plan.summary.totalSteps === 0
    ? kleur.green("✓ no migration needed")
    : kleur.bold(`→ ${plan.slug}: v${plan.fromVersion} → v${plan.toVersion}`);
  process.stdout.write(`\n${head}\n\n`);

  if (plan.summary.totalSteps === 0) {
    process.stdout.write(kleur.dim("  (contracts are equivalent — nothing to migrate)\n\n"));
    return;
  }

  // Header row.
  const cols = ["id", "kind", "risk", "rev", "description"];
  const widths = [28, 26, 6, 4, 50];
  const sep =
    "+" + widths.map((w) => "-".repeat(w + 2)).join("+") + "+\n";
  const row = (vals) =>
    "|" +
    vals
      .map((v, i) => " " + String(v).padEnd(widths[i]).slice(0, widths[i]) + " ")
      .join("|") +
    "|\n";

  process.stdout.write(sep);
  process.stdout.write(row(cols));
  process.stdout.write(sep);
  for (const step of plan.steps) {
    process.stdout.write(
      row([
        step.id,
        step.kind,
        step.risk,
        step.reversible ? "yes" : "NO",
        step.description.replace(/\s+/g, " ").slice(0, widths[4]),
      ]),
    );
  }
  process.stdout.write(sep);

  // Per-step detail.
  for (const step of plan.steps) {
    process.stdout.write(`\n${kleur.bold(step.id)} ${kleur.dim("(" + step.kind + ")")}\n`);
    process.stdout.write(`  ${step.description}\n`);
    if (step.artifacts.note) {
      process.stdout.write(`  ${kleur.dim("note:")} ${step.artifacts.note}\n`);
    }
    if (step.artifacts.envExample) {
      process.stdout.write(`  ${kleur.dim(".env.example:")} ${step.artifacts.envExample}\n`);
    }
  }

  process.stdout.write(
    `\n${kleur.bold("summary")}: ${plan.summary.totalSteps} step(s) — ` +
      `${kleur.red(plan.summary.highRisk + " high-risk")}, ` +
      `${kleur.yellow(plan.summary.irreversible + " irreversible")}\n`,
  );

  if (plan.warnings.length > 0) {
    process.stdout.write(`\n${kleur.bold("warnings:")}\n`);
    for (const w of plan.warnings) {
      process.stdout.write(`  ${kleur.yellow("⚠")} ${w}\n`);
    }
  }
  process.stdout.write(
    `\n${kleur.dim(
      "pass --json for machine-readable output, --write-files to materialize convex/migrations/.",
    )}\n\n`,
  );
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
