// MCP resource provider for slice-DNA lineage data.
//
// URIs served:
//   rr://graph/lineage                      — full graph (nodes + edges + slices)
//   rr://graph/lineage/<slug>               — single slice DNA
//   rr://graph/consumers/<consumer-name>    — every slice that consumer adopted
//
// Data is loaded via dna.mjs from `.kitab/lineage/<slug>.dna.json`. The CLI
// package is a runtime dep of this MCP package, so the import resolves either
// via node_modules (published) or sibling-monorepo path (dev). The fallback
// mirrors data-loader.mjs's strategy for manifest.json.

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load dna.mjs via dynamic import, resolved against the runtime-dep CLI package
// or the monorepo sibling. Cached after first hit.
let _dnaModulePromise = null;
function loadDna() {
  if (_dnaModulePromise) return _dnaModulePromise;
  _dnaModulePromise = (async () => {
    // Strategy 1: published rahman-resources package
    try {
      const resolved = require.resolve("rahman-resources/lib/dna.mjs");
      return await import(resolved);
    } catch {
      // fall through
    }
    // Strategy 2: sibling-monorepo path
    const local = path.resolve(__dirname, "../../../cli/lib/dna.mjs");
    if (existsSync(local)) {
      return await import(local);
    }
    throw new Error(
      "rahman-resources-mcp: cannot locate rahman-resources/lib/dna.mjs — install rahman-resources as a dep or run from the monorepo.",
    );
  })();
  return _dnaModulePromise;
}

export const LINEAGE_URI_PREFIX = "rr://graph/";

/**
 * Static list of lineage URIs to advertise via ListResources.
 * Returns [{ uri, name, description, mimeType }].
 */
export async function listLineageResources() {
  const dna = await loadDna();
  const all = dna.listAllDNA();

  const resources = [
    {
      uri: "rr://graph/lineage",
      name: "Slice DNA — full graph",
      description:
        "All slice-DNA lineage as a graph: nodes (sources, slices, consumers) + edges (lineage transforms + consumer adoption with drift).",
      mimeType: "application/json",
    },
  ];

  // Per-slice
  for (const d of all) {
    resources.push({
      uri: `rr://graph/lineage/${d.id}`,
      name: `DNA — ${d.id}`,
      description: `Full lineage + consumer adoption for the ${d.id} slice.`,
      mimeType: "application/json",
    });
  }

  // Per-consumer
  const consumers = new Set();
  for (const d of all) {
    for (const c of Object.keys(d.consumers ?? {})) consumers.add(c);
  }
  for (const c of [...consumers].sort()) {
    resources.push({
      uri: `rr://graph/consumers/${c}`,
      name: `Consumer — ${c}`,
      description: `Every kitab slice the "${c}" consumer adopted (version + drift score).`,
      mimeType: "application/json",
    });
  }

  return resources;
}

/**
 * Returns { match: true, payload } if the URI is handled, or { match: false }.
 * payload is a plain JS value — the caller serializes to JSON.
 */
export async function readLineageResource(uri) {
  if (typeof uri !== "string" || !uri.startsWith(LINEAGE_URI_PREFIX)) {
    return { match: false };
  }

  const dna = await loadDna();

  if (uri === "rr://graph/lineage") {
    const graph = dna.buildLineageGraph();
    const slices = dna.listAllDNA();
    return { match: true, payload: { slices, graph } };
  }

  const sliceMatch = uri.match(/^rr:\/\/graph\/lineage\/([a-z0-9][a-z0-9-]*[a-z0-9])$/);
  if (sliceMatch) {
    const slug = sliceMatch[1];
    const found = dna.readDNA(slug);
    if (!found) return { match: true, error: `DNA not found for slice: ${slug}` };
    return { match: true, payload: found };
  }

  const consumerMatch = uri.match(/^rr:\/\/graph\/consumers\/([a-z0-9][a-z0-9-]*[a-z0-9])$/);
  if (consumerMatch) {
    const consumer = consumerMatch[1];
    const all = dna.listAllDNA();
    /** @type {Array<{slice: string, version: string, drift_score: number, adopted_at: string, last_synced_at?: string}>} */
    const adoptions = [];
    for (const d of all) {
      const ad = d.consumers?.[consumer];
      if (!ad) continue;
      adoptions.push({
        slice: d.id,
        version: ad.version,
        drift_score: ad.drift_score,
        adopted_at: ad.adopted_at,
        last_synced_at: ad.last_synced_at,
      });
    }
    return {
      match: true,
      payload: {
        consumer,
        count: adoptions.length,
        adoptions,
      },
    };
  }

  return { match: true, error: `Unknown lineage URI: ${uri}` };
}
