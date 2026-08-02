// `rr update <slug>` — bidirectional sync: pull the latest kitab version of a
// slice into the consumer's local copy via 3-way semantic merge.
//
// Flow:
//   1. Locate the kitab repo root + consumer slice dir (from rr.json install
//      records).
//   2. Build a base snapshot from the lineage-pinned kitab commit (via git
//      show), falling back to the kitab tip when there's no DNA entry yet.
//   3. Build a kitab-tip snapshot from frontend/slices/<slug>/.
//   4. Build a consumer snapshot from the local slice dir.
//   5. Run merge3() — print the summary + outcomes table.
//   6. If --apply, applyMerge() to the consumer dir; refuse when conflicts
//      remain unless --force.
//   7. Append a "3-way-merge" lineage entry and upsert the consumer's
//      `drift_score = report.driftAfterMerge`.
//
// Flags:
//   --apply        write merged files to consumer dir (otherwise dry preview)
//   --force        allow apply even with conflicts (uses each side's last value)
//   --rr-path P    explicit rr.json path (overrides cwd discovery)
//   --json         emit machine-readable JSON instead of ASCII
//
// Module split (kept ≤200 LOC each):
//   - update-context.mjs  — rr.json/kitab-root resolution + snapshot builders
//   - update-output.mjs   — ASCII reporter + force-apply / DNA helpers

import kleur from "kleur";

import { merge3, applyMerge } from "../lib/merge3.mjs";
import {
  resolveContext,
  buildKitabSnapshot,
  buildBaseSnapshot,
  buildConsumerSnapshot,
} from "./update-context.mjs";
import {
  printReport,
  recordLineage,
  buildForcedSnapshot,
  writeForced,
} from "./update-output.mjs";

/**
 * Entry point invoked by cli.js with the post-`update` argv tail.
 * @param {string[]} rest
 */
export async function runUpdate(rest) {
  const { positional, flags } = parseFlags(rest);
  const slug = positional[0];
  if (!slug) {
    process.stderr.write(
      kleur.red("Usage: rahman-resources update <slug> [--apply] [--force] [--rr-path P] [--json]\n"),
    );
    process.exit(1);
  }

  const asJson = !!flags.json;
  const apply = !!flags.apply;
  const force = !!flags.force;
  const rrPath = typeof flags["rr-path"] === "string" ? flags["rr-path"] : null;

  const ctx = resolveContext(slug, rrPath);

  const kitabSnap = await buildKitabSnapshot(slug, ctx);
  const baseSnap = await buildBaseSnapshot(slug, ctx, kitabSnap);
  const consumerSnap = await buildConsumerSnapshot(slug, ctx);

  const report = merge3({ base: baseSnap, kitab: kitabSnap, consumer: consumerSnap });

  if (asJson) {
    process.stdout.write(JSON.stringify(report, null, 2) + "\n");
  } else {
    printReport(report, ctx);
  }

  const hasConflicts = report.summary.conflicts > 0;
  if (apply) {
    if (hasConflicts && !force) {
      if (!asJson) {
        process.stderr.write(
          kleur.red(
            `\n✖ Refusing to apply — ${report.summary.conflicts} conflict(s) remain. Resolve them or pass --force.\n`,
          ),
        );
      }
      process.exit(1);
    }
    const targetDir = ctx.consumerSliceDir;
    if (hasConflicts && force) {
      // Build a forced snapshot — prefer kitab on conflicts (matches "pull
      // kitab" semantics; consumer can revert manually after).
      const forced = buildForcedSnapshot(report, kitabSnap);
      // Write files directly, bypassing applyMerge's conflict guard.
      await writeForced(forced, targetDir);
    } else {
      await applyMerge(report, targetDir);
    }
    if (!asJson) {
      process.stdout.write(kleur.green(`\n✓ Applied merged files to ${ctx.consumerSliceDir}\n`));
    }
  }

  // Update DNA lineage — only when we actually applied OR when explicitly
  // asked via --json (machine flows record every sync attempt).
  if (apply || asJson) {
    recordLineage(slug, ctx, report);
  }

  if (hasConflicts && !force) {
    process.exit(1);
  }
}

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
