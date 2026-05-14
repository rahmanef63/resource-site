// dna.mjs — slice-DNA lineage tracker (Phase C of the Slice Composition Compiler).
//
// Reader/writer for `.kitab/lineage/<slug>.dna.json`. Each DNA file records
// where a slice came from (lineage[]) and which consumers later adopted it
// (consumers{}). Types live in dna.d.ts.
//
// Runtime contract:
//   - .kitab/lineage/ lives at the kitab repo root (resolved by walking up
//     from this file). If the directory doesn't exist, write* creates it.
//   - Files are pretty-printed JSON, trailing newline. Idempotent re-writes
//     keep diffs clean.
//
// The functions here are deliberately synchronous despite the spec hinting
// at fs.promises — the consumers (CLI + MCP) are both single-shot processes
// where async I/O adds noise without buying parallelism. The d.ts mirrors
// this signature exactly.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Walk up from packages/cli/lib/ to the kitab repo root (the directory
// containing `packages/`). Anchors the .kitab/lineage path regardless of
// where the CLI is invoked from.
function findRepoRoot() {
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    if (existsSync(path.join(dir, "packages")) && existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback: assume cwd is the repo root.
  return process.cwd();
}

const REPO_ROOT = findRepoRoot();

export function getLineageDir() {
  return path.join(REPO_ROOT, ".kitab", "lineage");
}

export function getDNAPath(slug) {
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
    throw new Error(`dna: invalid slug "${slug}" — must be kebab-case`);
  }
  return path.join(getLineageDir(), `${slug}.dna.json`);
}

function ensureDir() {
  const d = getLineageDir();
  if (!existsSync(d)) mkdirSync(d, { recursive: true });
}

/** @returns {import("./dna").SliceDNA | null} */
export function readDNA(slug) {
  const p = getDNAPath(slug);
  if (!existsSync(p)) return null;
  try {
    const raw = readFileSync(p, "utf8");
    const parsed = JSON.parse(raw);
    return normalizeDNA(parsed, slug);
  } catch (err) {
    throw new Error(`dna: failed to parse ${p}: ${err.message ?? err}`);
  }
}

/** @param {import("./dna").SliceDNA} dna */
export function writeDNA(dna) {
  if (!dna || typeof dna !== "object" || !dna.id) {
    throw new Error("dna.writeDNA: dna.id is required");
  }
  ensureDir();
  const normalized = normalizeDNA(dna, dna.id);
  const p = getDNAPath(normalized.id);
  writeFileSync(p, JSON.stringify(normalized, null, 2) + "\n");
}

/** @param {string} slug @param {import("./dna").LineageEntry} entry */
export function appendLineage(slug, entry) {
  const existing = readDNA(slug) ?? newDNA(slug);
  if (!entry || typeof entry !== "object" || !entry.from || !entry.at) {
    throw new Error("dna.appendLineage: entry.from and entry.at are required");
  }
  existing.lineage.push({
    from: entry.from,
    to: entry.to,
    at: entry.at,
    transforms: Array.isArray(entry.transforms) ? entry.transforms : [],
    actor: entry.actor,
  });
  writeDNA(existing);
  return existing;
}

/** @param {string} slug @param {string} consumer @param {import("./dna").ConsumerAdoption} adoption */
export function upsertConsumerAdoption(slug, consumer, adoption) {
  if (!consumer) throw new Error("dna.upsertConsumerAdoption: consumer is required");
  if (!adoption || typeof adoption !== "object") {
    throw new Error("dna.upsertConsumerAdoption: adoption object is required");
  }
  const existing = readDNA(slug) ?? newDNA(slug);
  existing.consumers[consumer] = {
    adopted_at: adoption.adopted_at,
    version: adoption.version,
    drift_score: clampDrift(adoption.drift_score),
    last_synced_at: adoption.last_synced_at,
  };
  writeDNA(existing);
  return existing;
}

/** @returns {import("./dna").SliceDNA[]} */
export function listAllDNA() {
  const d = getLineageDir();
  if (!existsSync(d)) return [];
  const files = readdirSync(d).filter((f) => f.endsWith(".dna.json"));
  const out = [];
  for (const f of files) {
    const slug = f.replace(/\.dna\.json$/, "");
    const dna = readDNA(slug);
    if (dna) out.push(dna);
  }
  // Stable ordering — alphabetical by slug.
  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}

/** @returns {import("./dna").LineageGraph} */
export function buildLineageGraph() {
  const all = listAllDNA();
  /** @type {Map<string, import("./dna").LineageGraphNode>} */
  const nodes = new Map();
  /** @type {import("./dna").LineageGraphEdge[]} */
  const edges = [];

  function addNode(id, type) {
    if (!nodes.has(id)) nodes.set(id, { id, type });
  }

  for (const dna of all) {
    const sliceId = `slice:${dna.id}`;
    addNode(sliceId, "slice");

    // lineage edges: source → slice
    for (const entry of dna.lineage ?? []) {
      const sourceId = `source:${entry.from}`;
      addNode(sourceId, "source");
      // If `to` looks like a different slice / kitab tag, prefer the slice node;
      // otherwise treat `to` as the kitab itself and target the slice node.
      const targetId = entry.to && entry.to.startsWith("kitab:") ? sliceId : sliceId;
      edges.push({
        from: sourceId,
        to: targetId,
        transforms: entry.transforms,
        at: entry.at,
      });
    }

    // consumer edges: slice → consumer
    for (const [consumerName, adoption] of Object.entries(dna.consumers ?? {})) {
      const consumerId = `consumer:${consumerName}`;
      addNode(consumerId, "consumer");
      edges.push({
        from: sliceId,
        to: consumerId,
        transforms: [`drift:${adoption.drift_score}`, `v${adoption.version}`],
        at: adoption.adopted_at,
      });
    }
  }

  return { nodes: [...nodes.values()], edges };
}

// ─── helpers ──────────────────────────────────────────────────────────────

/** Build a fresh DNA shell for a slug. */
function newDNA(slug) {
  return {
    id: slug,
    created_at: new Date().toISOString(),
    lineage: [],
    consumers: {},
  };
}

/** Fill in defaults + drop unknown fields. */
function normalizeDNA(raw, slug) {
  const out = {
    id: typeof raw.id === "string" ? raw.id : slug,
    created_at:
      typeof raw.created_at === "string" ? raw.created_at : new Date().toISOString(),
    lineage: [],
    consumers: {},
  };
  if (Array.isArray(raw.lineage)) {
    for (const e of raw.lineage) {
      if (!e || typeof e !== "object" || !e.from || !e.at) continue;
      out.lineage.push({
        from: String(e.from),
        to: e.to ? String(e.to) : undefined,
        at: String(e.at),
        transforms: Array.isArray(e.transforms) ? e.transforms.map(String) : [],
        actor: e.actor ? String(e.actor) : undefined,
      });
    }
  }
  if (raw.consumers && typeof raw.consumers === "object") {
    for (const [k, v] of Object.entries(raw.consumers)) {
      if (!v || typeof v !== "object") continue;
      out.consumers[k] = {
        adopted_at: String(v.adopted_at ?? ""),
        version: String(v.version ?? "0.0.0"),
        drift_score: clampDrift(v.drift_score),
        last_synced_at: v.last_synced_at ? String(v.last_synced_at) : undefined,
      };
    }
  }
  return out;
}

function clampDrift(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 100) return 100;
  return Math.round(x);
}
