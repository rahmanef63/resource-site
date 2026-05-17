// migrate-load.mjs — contract-loading helpers for `rr migrate`.
//
// Extracted from migrate.mjs. Resolves on-disk vs historic contract files
// (via git show) and evaluates them with `npx tsx` to JSON-serialize the
// named `contract` export. Also exposes argv parsing + repo-root finder
// shared with the dispatcher.

import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

export function parseFlags(rest) {
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

export function findRepoRoot(start) {
  let dir = start;
  for (let i = 0; i < 8; i++) {
    if (
      existsSync(path.join(dir, "packages")) &&
      existsSync(path.join(dir, "package.json"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

const SLICE_ROOTS = [
  ["frontend", "slices"],
  ["template-base", "frontend", "slices"],
];

function resolveContractPath(repoRoot, slug) {
  for (const segs of SLICE_ROOTS) {
    const p = path.join(repoRoot, ...segs, slug, "slice.contract.ts");
    if (existsSync(p)) return p;
  }
  return null;
}

function resolveContractRelPath(repoRoot, slug) {
  for (const segs of SLICE_ROOTS) {
    const rel = [...segs, slug, "slice.contract.ts"].join("/");
    if (existsSync(path.join(repoRoot, rel))) return rel;
  }
  return null;
}

export function loadCurrentContract(repoRoot, slug) {
  const p = resolveContractPath(repoRoot, slug);
  if (!p) return null;
  return evalContract(repoRoot, p, null);
}

/**
 * Resolve the contract at a historic version. Strategy:
 *   1. Try git tags `v<ver>`, `<ver>`, `<slug>-v<ver>` against the contract file.
 *   2. If none have the right version, scan recent commits touching the file
 *      and pick the most recent one whose contract.version === fromVersion.
 */
export function loadHistoricContract(repoRoot, slug, fromVersion) {
  const rel = resolveContractRelPath(repoRoot, slug);
  if (!rel) return null;

  const candidates = [`v${fromVersion}`, fromVersion, `${slug}-v${fromVersion}`];
  for (const ref of candidates) {
    const text = gitShowFile(repoRoot, ref, rel);
    if (text) {
      const c = evalContract(repoRoot, null, text);
      if (c && c.version === fromVersion) return c;
    }
  }

  // Fallback: scan commit history for the file.
  const log = spawnSync("git", ["log", "--format=%H", "--", rel], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (log.status === 0 && log.stdout) {
    const hashes = log.stdout.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const sha of hashes) {
      const text = gitShowFile(repoRoot, sha, rel);
      if (!text) continue;
      const c = evalContract(repoRoot, null, text);
      if (c && c.version === fromVersion) return c;
    }
  }
  return null;
}

function gitShowFile(repoRoot, ref, relPath) {
  const res = spawnSync("git", ["show", `${ref}:${relPath}`], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (res.status === 0 && typeof res.stdout === "string") return res.stdout;
  return null;
}

/**
 * Eval a contract file by spawning `npx tsx` and reading the JSON output.
 * Pass `filePath` (absolute) for the on-disk version OR `inlineText` for a
 * historic version pulled via git show.
 */
function evalContract(repoRoot, filePath, inlineText) {
  if (filePath) {
    const rel = "./" + path.relative(repoRoot, filePath);
    const code = [
      `import(${JSON.stringify(rel)})`,
      `  .then(m => { const c = m.contract || (m.default && m.default.contract); if (!c) { process.exit(2); } process.stdout.write(JSON.stringify(c)); })`,
      `  .catch((e) => { process.stderr.write(String(e && e.stack || e)); process.exit(3); });`,
    ].join("\n");
    const res = spawnSync("npx", ["--no-install", "tsx", "-e", code], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    if (res.status === 0 && res.stdout) {
      try {
        return JSON.parse(res.stdout);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Inline mode: write to a temp file under the kitab root (so its tsconfig +
  // path aliases resolve) and eval. We use a `.migration-tmp/` folder so the
  // temp file is colocated with packages/ but easy to ignore.
  if (typeof inlineText !== "string") return null;
  const tmpDir = path.join(repoRoot, ".migration-tmp");
  mkdirSync(tmpDir, { recursive: true });
  const tmpFile = path.join(
    tmpDir,
    `contract-${Date.now()}-${Math.random().toString(36).slice(2)}.ts`,
  );
  try {
    // Rewrite the import path back to the absolute kitab `contract` module so
    // `../../../packages/cli/lib/contract` (from a historic file pulled via
    // git show) keeps resolving after we move it to a different directory.
    const adjusted = adjustContractImport(inlineText, repoRoot, tmpDir);
    writeFileSync(tmpFile, adjusted);
    return evalContract(repoRoot, tmpFile, null);
  } finally {
    try {
      if (existsSync(tmpFile)) unlinkSync(tmpFile);
    } catch {
      // ignore
    }
  }
}

/**
 * Replace any `from "..contract"` import in the contract body with an
 * absolute path so the temp-file copy still resolves the same module.
 */
function adjustContractImport(text, repoRoot, tmpDir) {
  const contractMod = path.join(repoRoot, "packages", "cli", "lib", "contract");
  const relFromTmp = path
    .relative(tmpDir, contractMod)
    .split(path.sep)
    .join("/");
  // Match imports ending in /contract or /contract.ts (with or without .ts).
  return text.replace(
    /from\s+["'][^"']*\/contract(?:\.ts)?["']/g,
    `from "${relFromTmp}"`,
  );
}
