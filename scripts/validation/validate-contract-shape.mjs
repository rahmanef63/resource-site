// validate-contract-shape.mjs — shape checks + contract loader.
//
// Extracted from validate-contract.mjs. Replicates the runtime invariants of
// `defineSliceContract()` so the CI gate can flag malformed contracts without
// crashing the tsx eval. Kept regex-in-sync with packages/cli/lib/contract.ts.

import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { relative } from "node:path";

// ---------------------------------------------------------------------------
// Regex set — kept in sync with packages/cli/lib/contract-validate.ts.
// ---------------------------------------------------------------------------
const KEBAB_CASE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const SEMVER =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const PREFIX = /^[a-z][a-z0-9_]*_$/;
const CONFLICT_RE =
  /^[a-z][a-z0-9-]*:(routes|hooks|tables|events|components)\.[A-Za-z0-9_\-\/]+$/;
const PERMISSION = /^[^.]+\.[^.]+$/;

/**
 * Replicates defineSliceContract's runtime invariants for the validator.
 * Returns array of human-readable error strings (empty on success).
 */
export function shapeCheck(c) {
  const errs = [];
  if (!c || typeof c !== "object") {
    errs.push("contract is not an object");
    return errs;
  }
  if (typeof c.id !== "string" || !KEBAB_CASE.test(c.id)) {
    errs.push(`id "${String(c.id)}" must be kebab-case`);
  }
  if (typeof c.version !== "string" || !SEMVER.test(c.version)) {
    errs.push(`version "${String(c.version)}" is not semver`);
  }
  const requires = c.requires || {};
  const provides = c.provides || {};

  if (Array.isArray(requires.rbac)) {
    for (const p of requires.rbac) {
      if (typeof p !== "string" || !PERMISSION.test(p)) {
        errs.push(`rbac entry "${String(p)}" must be "<domain>.<action>"`);
      }
    }
  }

  const cx = requires.convex;
  if (cx) {
    if (typeof cx.prefix !== "string" || !PREFIX.test(cx.prefix)) {
      errs.push(`convex.prefix "${String(cx.prefix)}" must match /^[a-z][a-z0-9_]*_$/`);
    } else {
      if (!Array.isArray(cx.tables)) {
        errs.push("convex.tables must be an array");
      } else {
        for (const t of cx.tables) {
          if (typeof t !== "string" || !t.startsWith(cx.prefix)) {
            errs.push(`convex.tables entry "${String(t)}" must start with prefix "${cx.prefix}"`);
          }
        }
      }
      if (Array.isArray(provides.tables)) {
        for (const t of provides.tables) {
          if (typeof t !== "string" || !t.startsWith(cx.prefix)) {
            errs.push(
              `provides.tables entry "${String(t)}" must start with prefix "${cx.prefix}"`,
            );
          }
        }
      }
    }
  }

  if (c.conflicts) {
    if (!Array.isArray(c.conflicts)) {
      errs.push("conflicts must be an array");
    } else {
      for (const cf of c.conflicts) {
        if (typeof cf !== "string" || !CONFLICT_RE.test(cf)) {
          errs.push(
            `conflicts entry "${String(cf)}" must match "<slug>:<routes|hooks|tables|events|components>.<value>"`,
          );
        }
      }
    }
  }

  return errs;
}

/**
 * Load a contract from a `.ts` file.
 *
 * Strategy: spawn `npx tsx` to dynamic-import the file and JSON-stringify the
 * named `contract` export. Falls back to a regex pre-parse that only verifies
 * the file structurally calls `defineSliceContract({...})` if tsx is
 * unavailable or returns a non-zero exit.
 */
export function loadContract(filePath, ROOT) {
  // Dynamic import — tsx wraps named exports under `default` namespace, so we
  // try both shapes. Use a relative path so tsx resolves it correctly.
  const rel = "./" + relative(ROOT, filePath);
  const code = [
    `import(${JSON.stringify(rel)})`,
    `  .then(m => { const c = m.contract || (m.default && m.default.contract); if (!c) { process.stderr.write("no-contract-export"); process.exit(2); } process.stdout.write(JSON.stringify(c)); })`,
    `  .catch(e => { process.stderr.write(String(e && e.message || e)); process.exit(3); });`,
  ].join("\n");
  const res = spawnSync("npx", ["--no-install", "tsx", "-e", code], {
    cwd: ROOT,
    encoding: "utf8",
  });
  if (res.status === 0 && res.stdout) {
    try {
      return { ok: true, contract: JSON.parse(res.stdout), source: "tsx" };
    } catch {
      /* fall through */
    }
  }

  return { ok: false, error: "tsx-load-failed", stderr: res.stderr || "" };
}

export async function regexFallback(filePath) {
  const src = await readFile(filePath, "utf8");
  const hasFactory = /defineSliceContract\s*\(\s*\{/.test(src);
  const hasExport = /export\s+const\s+contract\s*=/.test(src);
  if (!hasFactory || !hasExport) {
    return [
      `regex-fallback: file does not export \`const contract = defineSliceContract({...})\``,
    ];
  }
  return [];
}
