// migrate-print.mjs — ASCII rendering of a MigrationPlan.
//
// Extracted from migrate.mjs.

import kleur from "kleur";

export function printPlan(plan) {
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
