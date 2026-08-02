// graph-render.mjs — ASCII renderers for `rr graph`.
//
// Extracted from graph.mjs.

import kleur from "kleur";

import { listAllDNA, readDNA } from "../lib/dna.mjs";

export function printSummary() {
  const slices = listAllDNA();
  if (slices.length === 0) {
    console.log(
      kleur.yellow("No DNA files in .kitab/lineage/. ") +
        kleur.dim("Seed some via `rr graph` integrations or manual write."),
    );
    return;
  }
  console.log(kleur.bold(`\nDNA graph — ${slices.length} slice(s)\n`));

  // Header table: slug | lineage count | consumers | newest source
  const rows = [];
  for (const dna of slices) {
    const newest = dna.lineage[dna.lineage.length - 1];
    rows.push({
      slug: dna.id,
      lineage: dna.lineage.length,
      consumers: Object.keys(dna.consumers).length,
      source: newest ? newest.from : "—",
    });
  }
  const w1 = Math.max(4, ...rows.map((r) => r.slug.length));
  const w4 = Math.max(6, ...rows.map((r) => String(r.source).length));
  console.log(
    "  " +
      kleur.bold("slug".padEnd(w1)) +
      "  " +
      kleur.bold("hops".padEnd(4)) +
      "  " +
      kleur.bold("adopts".padEnd(6)) +
      "  " +
      kleur.bold("latest source".padEnd(w4)),
  );
  console.log(
    "  " +
      kleur.dim("-".repeat(w1)) +
      "  " +
      kleur.dim("----") +
      "  " +
      kleur.dim("------") +
      "  " +
      kleur.dim("-".repeat(w4)),
  );
  for (const r of rows) {
    console.log(
      "  " +
        kleur.cyan(r.slug.padEnd(w1)) +
        "  " +
        String(r.lineage).padEnd(4) +
        "  " +
        String(r.consumers).padEnd(6) +
        "  " +
        kleur.dim(r.source),
    );
  }

  // Consumer adoption matrix.
  /** @type {Set<string>} */
  const consumerSet = new Set();
  for (const dna of slices) {
    for (const c of Object.keys(dna.consumers)) consumerSet.add(c);
  }
  const consumers = [...consumerSet].sort();
  if (consumers.length > 0) {
    console.log(kleur.bold(`\nAdoption matrix\n`));
    const cw = Math.max(4, ...rows.map((r) => r.slug.length));
    console.log(
      "  " +
        " ".repeat(cw) +
        "  " +
        consumers
          .map((c) => kleur.bold(c.slice(0, 10).padEnd(10)))
          .join("  "),
    );
    for (const dna of slices) {
      const cells = consumers
        .map((c) => {
          const ad = dna.consumers[c];
          if (!ad) return kleur.dim("·".padEnd(10));
          const drift = ad.drift_score;
          const tag = `v${ad.version} ${drift}%`.slice(0, 10).padEnd(10);
          if (drift >= 40) return kleur.red(tag);
          if (drift >= 15) return kleur.yellow(tag);
          return kleur.green(tag);
        })
        .join("  ");
      console.log("  " + kleur.cyan(dna.id.padEnd(cw)) + "  " + cells);
    }
    console.log(
      kleur.dim(
        `\n  legend: green <15% drift, yellow 15-39%, red >=40%, · = not adopted`,
      ),
    );
  }

  console.log(
    kleur.dim(
      `\nRun \`rr graph <slug>\` for the full lineage tree, \`--json\` for machine output.\n`,
    ),
  );
}

export function printSliceTree(slug) {
  const dna = readDNA(slug);
  if (!dna) {
    console.error(
      kleur.red(`✖ No DNA found for "${slug}".`) +
        kleur.dim(`  (expected .kitab/lineage/${slug}.dna.json)`),
    );
    process.exit(1);
  }
  console.log(
    `\n${kleur.bold(dna.id)}  ${kleur.dim(
      `created ${dna.created_at}`,
    )}\n`,
  );

  // Lineage chain — chronological top-down tree.
  console.log(kleur.bold("Lineage"));
  if (dna.lineage.length === 0) {
    console.log("  " + kleur.dim("(no lineage entries)"));
  } else {
    const sorted = [...dna.lineage].sort((a, b) =>
      String(a.at).localeCompare(String(b.at)),
    );
    sorted.forEach((entry, i) => {
      const isLast = i === sorted.length - 1;
      const bullet = isLast ? "└─" : "├─";
      const cont = isLast ? "  " : "│ ";
      console.log(
        `  ${kleur.dim(bullet)} ${kleur.cyan(entry.from)}` +
          (entry.to ? ` ${kleur.dim("→")} ${kleur.green(entry.to)}` : "") +
          `  ${kleur.dim(entry.at)}`,
      );
      if (entry.transforms?.length) {
        console.log(
          `  ${kleur.dim(cont)}   ${kleur.dim("transforms:")} ${entry.transforms.join(", ")}`,
        );
      }
      if (entry.actor) {
        console.log(`  ${kleur.dim(cont)}   ${kleur.dim("actor:")} ${entry.actor}`);
      }
    });
  }

  // Consumer adoption rows.
  console.log(`\n${kleur.bold("Consumers")}`);
  const consumers = Object.entries(dna.consumers);
  if (consumers.length === 0) {
    console.log("  " + kleur.dim("(no consumers recorded)"));
  } else {
    const w = Math.max(4, ...consumers.map(([c]) => c.length));
    for (const [name, ad] of consumers) {
      const drift = ad.drift_score;
      const driftStr =
        drift >= 40
          ? kleur.red(`${drift}%`)
          : drift >= 15
            ? kleur.yellow(`${drift}%`)
            : kleur.green(`${drift}%`);
      const sync = ad.last_synced_at ? ` synced ${ad.last_synced_at}` : "";
      console.log(
        `  ${kleur.cyan(name.padEnd(w))}  v${ad.version}  drift ${driftStr}  ${kleur.dim(
          `adopted ${ad.adopted_at}${sync}`,
        )}`,
      );
    }
  }
  console.log("");
}
