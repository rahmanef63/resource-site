// update-context.mjs — rr.json / kitab-root / consumer-slice-dir resolution
// + snapshot builders for `rr update`.
//
// Extracted from update.mjs.

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { snapshotFromDir } from "../lib/snapshot.mjs";
import { readDNA } from "../lib/dna.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {{
 *   repoRoot: string,
 *   rrPath: string,
 *   rr: any,
 *   consumerName: string,
 *   kitabRoot: string,
 *   kitabSliceDir: string,
 *   consumerSliceDir: string,
 * }} UpdateContext
 */

export function resolveContext(slug, explicitRrPath) {
  // The kitab repo lives above packages/cli/bin/.
  const kitabRoot = findKitabRoot();
  const kitabSliceDir = path.join(kitabRoot, "frontend", "slices", slug);
  if (!existsSync(kitabSliceDir)) {
    throw new Error(
      `update: kitab slice not found at ${kitabSliceDir}. (Did you mean a different slug?)`,
    );
  }

  const rrPath = explicitRrPath ? path.resolve(explicitRrPath) : path.resolve(process.cwd(), "rr.json");
  if (!existsSync(rrPath)) {
    throw new Error(
      `update: rr.json not found at ${rrPath}. Pass --rr-path or run from a consumer project.`,
    );
  }
  const rr = JSON.parse(readFileSync(rrPath, "utf8"));

  const consumerName = inferConsumerName(rr, rrPath);
  const consumerSliceDir = resolveConsumerSliceDir(rr, rrPath, slug);

  return {
    repoRoot: kitabRoot,
    rrPath,
    rr,
    consumerName,
    kitabRoot,
    kitabSliceDir,
    consumerSliceDir,
  };
}

function findKitabRoot() {
  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    if (
      existsSync(path.join(dir, "packages")) &&
      existsSync(path.join(dir, "frontend", "slices"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function inferConsumerName(rr, rrPath) {
  if (rr?.consumer && typeof rr.consumer === "string") return rr.consumer;
  if (rr?.template?.slug && typeof rr.template.slug === "string") {
    return rr.template.slug;
  }
  return path.basename(path.dirname(rrPath));
}

function resolveConsumerSliceDir(rr, rrPath, slug) {
  const rrDir = path.dirname(rrPath);
  // Honor a slice-root override if present in rr.json, else default to
  // frontend/slices/<slug>/ — matches the kitab convention.
  const sliceRoot =
    rr?.layout?.sliceRoot && typeof rr.layout.sliceRoot === "string"
      ? rr.layout.sliceRoot
      : "frontend/slices";
  return path.resolve(rrDir, sliceRoot, slug);
}

// ---------------------------------------------------------------------------
// Snapshot builders
// ---------------------------------------------------------------------------

export async function buildKitabSnapshot(slug, ctx) {
  return snapshotFromDir(slug, ctx.kitabSliceDir);
}

export async function buildConsumerSnapshot(slug, ctx) {
  if (!existsSync(ctx.consumerSliceDir)) {
    // First-time sync — consumer has no copy yet; treat as empty snapshot.
    return { slug, version: "0.0.0", files: {} };
  }
  return snapshotFromDir(slug, ctx.consumerSliceDir);
}

export async function buildBaseSnapshot(slug, ctx, kitabSnap) {
  // First-time sync (no DNA) → use kitab tip as base.
  const dna = readDNA(slug);
  const consumerAd = dna?.consumers?.[ctx.consumerName];
  if (!consumerAd?.version) {
    return cloneSnap(kitabSnap);
  }

  // Look up the commit by version tag, fall back to the most-recent commit
  // touching the slice path.
  const ref = findCommitForVersion(ctx.kitabRoot, slug, consumerAd.version);
  if (!ref) return cloneSnap(kitabSnap);

  const files = readSliceAtRef(ctx.kitabRoot, slug, ref);
  // Snapshot at base ref typically lacks a parsed contract — that's OK; the
  // merge algorithm treats it as no-membership, which mirrors "base had none".
  return { slug, version: consumerAd.version, files };
}

function cloneSnap(snap) {
  return {
    slug: snap.slug,
    version: snap.version,
    files: { ...snap.files },
    ...(snap.contract ? { contract: JSON.parse(JSON.stringify(snap.contract)) } : {}),
  };
}

/** Try `git rev-list -1 <tag>` then `git log -1 --format=%H -- <slicePath>`. */
function findCommitForVersion(repo, slug, version) {
  const sliceRel = `frontend/slices/${slug}`;
  for (const tag of [version, `v${version}`, `${slug}@${version}`]) {
    const r = spawnSync("git", ["rev-list", "-1", tag], {
      cwd: repo,
      encoding: "utf8",
    });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  }
  // Fallback: most-recent commit touching the slice path.
  const r = spawnSync(
    "git",
    ["log", "-1", "--format=%H", "main", "--", sliceRel],
    { cwd: repo, encoding: "utf8" },
  );
  if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  return null;
}

/** Read every tracked file under frontend/slices/<slug>/ at `ref` into a map. */
function readSliceAtRef(repo, slug, ref) {
  const sliceRel = `frontend/slices/${slug}`;
  const ls = spawnSync(
    "git",
    ["ls-tree", "-r", "--name-only", ref, "--", sliceRel],
    { cwd: repo, encoding: "utf8" },
  );
  /** @type {Record<string,string>} */
  const out = {};
  if (ls.status !== 0) return out;
  const lines = ls.stdout.split("\n").filter(Boolean);
  for (const line of lines) {
    const rel = line.startsWith(sliceRel + "/")
      ? line.slice(sliceRel.length + 1)
      : line;
    // Skip files we don't snapshot (binary etc).
    if (!/\.(ts|tsx|mjs|js|jsx|json|md|css)$/.test(rel)) continue;
    const show = spawnSync("git", ["show", `${ref}:${line}`], {
      cwd: repo,
      encoding: "utf8",
    });
    if (show.status === 0) out[rel] = show.stdout;
  }
  return out;
}
