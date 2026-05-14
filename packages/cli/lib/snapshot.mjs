// snapshot.mjs — build a SliceSnapshot from a slice directory.
//
// Walks the directory recursively, keeps only typical slice file extensions,
// reads `slice.contract.ts` when present and parses it (via `tsx` if
// available, regex fallback otherwise). Skips node_modules, .kitab, and
// dotfiles to keep snapshots stable across machines.

import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
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

  let contract;
  const contractPath = path.join(dir, "slice.contract.ts");
  if (existsSync(contractPath)) {
    contract = loadContract(contractPath) ?? regexLoadContract(await readFile(contractPath, "utf8"));
  }

  // Version preference: contract.version → slice.json.version → "0.0.0".
  let version = contract?.version ?? "0.0.0";
  if (!contract?.version && files["slice.json"]) {
    try {
      const meta = JSON.parse(files["slice.json"]);
      if (typeof meta.version === "string") version = meta.version;
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

/**
 * Mirror of validate-contract.mjs's tsx loader. Returns the parsed contract
 * or undefined on failure.
 */
function loadContract(filePath) {
  const code = [
    `import(${JSON.stringify(filePath)})`,
    `  .then(m => { const c = m.contract || (m.default && m.default.contract); if (!c) { process.exit(2); } process.stdout.write(JSON.stringify(c)); })`,
    `  .catch(e => { process.stderr.write(String(e && e.message || e)); process.exit(3); });`,
  ].join("\n");
  try {
    const res = spawnSync("npx", ["--no-install", "tsx", "-e", code], {
      encoding: "utf8",
    });
    if (res.status === 0 && res.stdout) {
      return JSON.parse(res.stdout);
    }
  } catch {
    /* tsx missing or failed */
  }
  return undefined;
}

/**
 * Best-effort regex fallback: extract the literal-ish object passed to
 * `defineSliceContract({ ... })`. We can't fully parse TS, but for the kitab's
 * contracts (small static literals) a JSON5-ish coerce works for the basic
 * shape we need here.
 */
function regexLoadContract(src) {
  const m = src.match(/defineSliceContract\s*\(\s*(\{[\s\S]*?\})\s*\)\s*;?\s*$/m);
  if (!m) return undefined;
  // Replace single quotes, strip trailing commas, quote keys.
  const body = m[1]
    .replace(/'([^'\\]*)'/g, '"$1"')
    .replace(/,(\s*[}\]])/g, "$1")
    .replace(/([{,]\s*)([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g, '$1"$2":')
    .replace(/\/\/.*$/gm, "");
  try {
    return JSON.parse(body);
  } catch {
    return undefined;
  }
}
