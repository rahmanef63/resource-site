// compose-print.mjs — human ASCII renderer for `rr compose`.
//
// Extracted from compose.mjs.

import path from "node:path";
import kleur from "kleur";

import { hasBlocker } from "./compose-state.mjs";

export function printHuman(result, { rrPath, repoRoot }) {
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
