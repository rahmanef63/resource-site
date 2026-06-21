// snapshot.mjs — build a SliceSnapshot from a slice directory.
//
// Walks the directory recursively, keeps only typical slice file extensions,
// and reads the folded composition contract from slice.json (`contract` block,
// id/version reattached from the slice.json scalars). Skips node_modules,
// .kitab, and dotfiles to keep snapshots stable across machines.

import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const INCLUDED_EXT = new Set([".ts", ".tsx", ".mjs", ".js", ".jsx", ".json", ".md", ".css"]);
const SKIP_DIRS = new Set(["node_modules", ".kitab", ".git", "dist", "build", ".next"]);

/**
 * @param {string} slug
 * @param {string} dir absolute path to the slice directory
 * @returns {Promise<import("./merge3").SliceSnapshot>}
 */
export async function snapshotFromDir(slug, dir) {
  if (!slug || typeof slug !== "string") {
    throw new Error("snapshotFromDir: slug required");
  }
  if (!dir || typeof dir !== "string") {
    throw new Error("snapshotFromDir: dir required");
  }
  if (!existsSync(dir)) {
    throw new Error(`snapshotFromDir: dir does not exist — ${dir}`);
  }

  /** @type {Record<string,string>} */
  const files = {};
  await walk(dir, dir, files);

  // The composition contract is folded into slice.json (`contract` block) since
  // Phase 2; reattach id/version from the slice.json scalars to keep the same
  // SliceContract shape the old slice.contract.ts exported.
  let contract;
  let version = "0.0.0";
  if (files["slice.json"]) {
    try {
      const meta = JSON.parse(files["slice.json"]);
      if (typeof meta.version === "string") version = meta.version;
      if (meta.contract && typeof meta.contract === "object") {
        contract = { id: meta.slug, version: meta.version, ...meta.contract };
      }
    } catch {
      /* ignore */
    }
  }

  /** @type {import("./merge3").SliceSnapshot} */
  const snap = { slug, version, files };
  if (contract) snap.contract = contract;
  return snap;
}

async function walk(root, dir, out) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      await walk(root, full, out);
      continue;
    }
    if (!e.isFile()) continue;
    const ext = path.extname(e.name);
    if (!INCLUDED_EXT.has(ext)) continue;
    const rel = path.relative(root, full).split(path.sep).join("/");
    try {
      const stats = await stat(full);
      if (stats.size > 1024 * 1024) continue; // skip files > 1MB
    } catch {
      continue;
    }
    out[rel] = await readFile(full, "utf8");
  }
}
