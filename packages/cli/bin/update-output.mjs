// update-output.mjs — ASCII reporter + force-apply / DNA helpers for
// `rr update`. Extracted from update.mjs.

import path from "node:path";
import kleur from "kleur";

import { appendLineage, readDNA, upsertConsumerAdoption } from "../lib/dna.mjs";

export function printReport(report, ctx) {
  const s = report.summary;
  process.stdout.write(
    `\n${kleur.bold("3-way merge")} — ${kleur.cyan(report.slug)} ` +
      kleur.dim(`(consumer: ${ctx.consumerName})`) +
      "\n",
  );
  process.stdout.write(
    `  ${kleur.green("auto-merged:")} ${s.autoMerged}  ` +
      `${kleur.green("kitab-clean:")} ${s.kitabWinsClean}  ` +
      `${kleur.yellow("consumer-clean:")} ${s.consumerWinsClean}  ` +
      `${kleur.red("conflicts:")} ${s.conflicts}  ` +
      `${kleur.dim("identical:")} ${s.identical}\n`,
  );
  process.stdout.write(
    `  ${kleur.bold("drift after merge:")} ${formatDrift(report.driftAfterMerge)}\n`,
  );

  const nonIdentical = report.outcomes.filter((o) => o.kind !== "identical");
  if (nonIdentical.length > 0) {
    process.stdout.write(`\n${kleur.bold("Outcomes")}\n`);
    for (const o of nonIdentical) {
      const tag = kindTag(o.kind);
      process.stdout.write(`  ${tag}  ${o.element}${o.conflictHint ? kleur.dim(`  — ${o.conflictHint}`) : ""}\n`);
    }
  }
  process.stdout.write("\n");
}

function formatDrift(d) {
  if (d >= 40) return kleur.red(`${d}%`);
  if (d >= 15) return kleur.yellow(`${d}%`);
  return kleur.green(`${d}%`);
}

function kindTag(k) {
  switch (k) {
    case "auto-merged":
      return kleur.green("[auto]    ");
    case "kitab-wins-clean":
      return kleur.green("[kitab]   ");
    case "consumer-wins-clean":
      return kleur.yellow("[consumer]");
    case "conflict":
      return kleur.red("[conflict]");
    default:
      return kleur.dim("[same]    ");
  }
}

export function recordLineage(slug, ctx, report) {
  const at = new Date().toISOString();
  try {
    appendLineage(slug, {
      from: `kitab:frontend/slices/${slug}`,
      to: `consumer:${ctx.consumerName}`,
      at,
      transforms: ["3-way-merge", "consumer-sync"],
      actor: "rr update",
    });
    const dna = readDNA(slug);
    const existing = dna?.consumers?.[ctx.consumerName];
    upsertConsumerAdoption(slug, ctx.consumerName, {
      adopted_at: existing?.adopted_at ?? at,
      version: report.mergedSnapshot?.version ?? existing?.version ?? "0.0.0",
      drift_score: report.driftAfterMerge,
      last_synced_at: at,
    });
  } catch (err) {
    process.stderr.write(
      kleur.yellow(
        `  (could not update DNA lineage: ${err.message ?? err})\n`,
      ),
    );
  }
}

export function buildForcedSnapshot(report, kitabSnap) {
  /** @type {Record<string,string>} */
  const files = {};
  for (const o of report.outcomes) {
    if (!o.element.startsWith("files/")) continue;
    const rel = o.element.slice("files/".length);
    if (o.kind === "conflict") {
      // On force-apply, prefer kitab value (or consumer if kitab dropped).
      const v = o.kitabValue ?? o.consumerValue;
      if (v != null) files[rel] = /** @type {string} */ (v);
    } else if (o.mergedValue != null) {
      files[rel] = /** @type {string} */ (o.mergedValue);
    }
  }
  return { slug: kitabSnap.slug, version: kitabSnap.version, files };
}

export async function writeForced(snap, targetDir) {
  const { mkdir, writeFile } = await import("node:fs/promises");
  for (const [rel, content] of Object.entries(snap.files)) {
    const dest = path.join(targetDir, rel);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, content);
  }
}
