// MCP resource provider for Wave N+3 sync-scan.
//
// URIs served:
//   rr://sync/scan                       — verdicts across all registered consumers
//   rr://sync/scan/<consumer-name>       — single consumer's slice diffs
//
// Data is loaded by reading consumer .kitab.json files and diffing against
// the kitab's slice.contract.ts versions. Implementation mirrors
// scan-consumers.mjs CLI but returns structured JSON instead of stdout.

import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let _cliModulePromise = null;
function loadCliModules() {
  if (_cliModulePromise) return _cliModulePromise;
  _cliModulePromise = (async () => {
    let manifest, scan;
    try {
      const cmPath = require.resolve("rahman-resources/lib/consumer-manifest.mjs");
      manifest = await import(cmPath);
      const scanPath = require.resolve("rahman-resources/bin/scan-consumers.mjs");
      scan = await import(scanPath);
    } catch {
      const cmLocal = path.resolve(__dirname, "../../../cli/lib/consumer-manifest.mjs");
      const scanLocal = path.resolve(__dirname, "../../../cli/bin/scan-consumers.mjs");
      if (!existsSync(cmLocal) || !existsSync(scanLocal)) {
        throw new Error(
          "rahman-resources-mcp: cannot locate consumer-manifest / scan-consumers from rahman-resources. Install rahman-resources or run from monorepo.",
        );
      }
      manifest = await import(cmLocal);
      scan = await import(scanLocal);
    }
    return { manifest, scan };
  })();
  return _cliModulePromise;
}

export const SYNC_URI_PREFIX = "rr://sync/";

async function readKitabContractVersions(kitabRoot) {
  const slicesDir = path.join(kitabRoot, "frontend", "slices");
  if (!existsSync(slicesDir)) return new Map();
  const out = new Map();
  const entries = await readdir(slicesDir, { withFileTypes: true });
  const ID_RE = /\bid\s*:\s*["']([a-z][a-z0-9-]*)["']/;
  const VERSION_RE = /\bversion\s*:\s*["'](\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)["']/;
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith("_")) continue;
    const contractPath = path.join(slicesDir, e.name, "slice.contract.ts");
    if (!existsSync(contractPath)) continue;
    try {
      const src = await readFile(contractPath, "utf8");
      const idMatch = src.match(ID_RE);
      const verMatch = src.match(VERSION_RE);
      if (idMatch && verMatch) out.set(idMatch[1], verMatch[1]);
    } catch {
      // skip
    }
  }
  return out;
}

async function scanOne(consumer, kitabVersions, manifestMod) {
  if (!existsSync(consumer.path)) {
    return { name: consumer.name, path: consumer.path, error: "path does not exist" };
  }
  const walked = await manifestMod.walkConsumerSlices(consumer.path);
  const diffs = [];
  const errors = [];
  const seen = new Set();
  for (const w of walked) {
    if (w.error) {
      errors.push({ dir: w.dir, message: w.error });
      continue;
    }
    const slug = w.manifest.kitabSlug;
    seen.add(slug);
    const kv = kitabVersions.get(slug) ?? null;
    diffs.push(manifestMod.diffSlice({ slug, manifest: w.manifest, kitabVersion: kv }));
  }
  for (const [slug, version] of kitabVersions) {
    if (!seen.has(slug)) {
      diffs.push(manifestMod.diffSlice({ slug, manifest: null, kitabVersion: version }));
    }
  }
  diffs.sort((a, b) => a.slug.localeCompare(b.slug));
  return { name: consumer.name, path: consumer.path, diffs, errors };
}

export async function listSyncResources() {
  const { scan } = await loadCliModules();
  const out = [
    {
      uri: "rr://sync/scan",
      name: "Consumer sync scan — all consumers",
      description:
        "Diff between kitab slice.contract.ts versions and each consumer repo's `.kitab.json` files. Surfaces up-needed / down-needed / diverged verdicts.",
      mimeType: "application/json",
    },
  ];
  for (const c of scan.DEFAULT_CONSUMERS) {
    out.push({
      uri: `rr://sync/scan/${c.name}`,
      name: `Sync scan — ${c.name}`,
      description: `Per-slice sync verdicts for the ${c.name} consumer at ${c.path}.`,
      mimeType: "application/json",
    });
  }
  return out;
}

export async function readSyncResource(uri) {
  const { manifest, scan } = await loadCliModules();
  const kitabRoot = path.resolve(__dirname, "../../../..");
  const kitabVersions = await readKitabContractVersions(kitabRoot);

  if (uri === "rr://sync/scan") {
    const reports = await Promise.all(
      scan.DEFAULT_CONSUMERS.map((c) => scanOne(c, kitabVersions, manifest)),
    );
    return JSON.stringify(
      { kitabContracts: kitabVersions.size, consumers: reports },
      null,
      2,
    );
  }

  const m = uri.match(/^rr:\/\/sync\/scan\/([a-z][a-z0-9-]*)$/);
  if (m) {
    const name = m[1];
    const consumer = scan.DEFAULT_CONSUMERS.find((c) => c.name === name);
    if (!consumer) {
      throw new Error(`unknown consumer "${name}"`);
    }
    const report = await scanOne(consumer, kitabVersions, manifest);
    return JSON.stringify(report, null, 2);
  }

  throw new Error(`unsupported sync URI: ${uri}`);
}
