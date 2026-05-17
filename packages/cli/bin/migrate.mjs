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
//
// Module split (kept ≤200 LOC each):
//   - migrate-load.mjs   — contract-loading (current + historic via git show)
//   - migrate-print.mjs  — ASCII rendering of a MigrationPlan

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import kleur from "kleur";

import { diffContracts, planMigration } from "../lib/migration-plan.mjs";
import { appendLineage } from "../lib/dna.mjs";
import { loadCurrentContract, loadHistoricContract } from "./migrate-load.mjs";
import { printPlan } from "./migrate-print.mjs";

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
    writePlanFiles({ plan, cwd, forceOverwrite, asJson });
    // 5) Append DNA lineage.
    appendMigrationLineage({ slug, plan, asJson });
  }
}

function writePlanFiles({ plan, cwd, forceOverwrite, asJson }) {
  const writeDir = path.join(cwd, "convex", "migrations");
  mkdirSync(writeDir, { recursive: true });
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
    if (!asJson) {
      process.stdout.write(
        `  ${kleur.green("+")} ${path.relative(cwd, file)}\n`,
      );
    }
  }
}

function appendMigrationLineage({ slug, plan, asJson }) {
  const writtenIds = plan.steps
    .filter((s) => !!s.artifacts?.convexMigration)
    .map((s) => s.id);
  if (writtenIds.length === 0) return;
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
