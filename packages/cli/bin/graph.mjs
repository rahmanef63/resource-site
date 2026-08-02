// `rr graph <slug?>` — render slice-DNA lineage to terminal.
//
// Surfaces:
//   rr graph                  → ASCII summary of every slice + consumer adoption matrix
//   rr graph --all            → alias for the above
//   rr graph <slug>           → full DNA for a single slice + ASCII lineage tree
//   rr graph <slug?> --json   → emit JSON instead of ASCII
//
// Dispatched from bin/cli.js. ASCII renderers live in graph-render.mjs.

import { buildLineageGraph, listAllDNA, readDNA } from "../lib/dna.mjs";
import { printSummary, printSliceTree } from "./graph-render.mjs";

/**
 * Entry point invoked by cli.js with the post-`graph` argv tail.
 * @param {string[]} rest
 */
export async function runGraph(rest) {
  const { positional, flags } = parseFlags(rest);
  const slug = positional[0];
  const asJson = !!flags.json;
  const all = !!flags.all || !slug;

  if (asJson) {
    if (all) {
      const graph = buildLineageGraph();
      const slices = listAllDNA();
      process.stdout.write(
        JSON.stringify({ slices, graph }, null, 2) + "\n",
      );
      return;
    }
    const dna = readDNA(slug);
    if (!dna) {
      process.stderr.write(`No DNA found for "${slug}".\n`);
      process.exit(1);
    }
    process.stdout.write(JSON.stringify(dna, null, 2) + "\n");
    return;
  }

  if (all) {
    printSummary();
    return;
  }
  printSliceTree(slug);
}

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
