// fold-contracts.mjs — Phase 2 (hybrid fold). Run via tsx so it can import the
// TS contracts directly (handles `as const`):
//   npx tsx scripts/migrate/fold-contracts.mjs [--apply]
//
// Folds each slice.contract.ts into slice.json under a `contract` key, MINUS the
// fields that are 100% duplicated by slice.json scalars (id == slug, version ==
// version) and MINUS requires.env (reconciled to slice.json deps.env — the
// richer home with scope). requires.deps is kept VERBATIM (dirty: mixes slugs /
// npm / objects — per-slice normalization is a tracked follow-up).
//
// Surgical text append (insert before the final `}`) so existing formatting +
// unicode escaping are untouched — only the contract block is added. Idempotent:
// skips a slice.json that already has a `contract` key. Default = dry-run (prints
// the first slice's result + the env-reconcile report); --apply writes.

import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const SLICES = path.join(REPO, "frontend", "slices");
const APPLY = process.argv.includes("--apply");

// Load the contract DATA. Most import cleanly under tsx. A few (e.g.
// platform-admin's 2-dot rbac) intentionally fail defineSliceContract's runtime
// invariants and survive in-repo only via audit's regex fallback — importing
// them runs the validator and throws. For those, stub defineSliceContract to
// identity in a temp copy so we still get the raw object verbatim.
let tmpN = 0;
async function loadContract(cp) {
  try {
    const m = await import(pathToFileURL(cp).href);
    return m.contract || m.default?.contract;
  } catch {
    const stubbed = readFileSync(cp, "utf8").replace(
      /import\s*\{[^}]*\bdefineSliceContract\b[^}]*\}\s*from\s*["'][^"']+["'];?/,
      "const defineSliceContract = (x) => x;",
    );
    const tmp = path.join(os.tmpdir(), `fold-${process.pid}-${tmpN++}.ts`);
    writeFileSync(tmp, stubbed);
    try {
      const m = await import(pathToFileURL(tmp).href);
      return m.contract || m.default?.contract;
    } finally {
      unlinkSync(tmp);
    }
  }
}

// Escape any non-ASCII codepoint back to \uXXXX so the appended block matches
// the existing slice.json escaping style (avoids — -> em-dash diff noise).
const escNonAscii = (s) =>
  Array.from(s)
    .map((c) => {
      const n = c.charCodeAt(0);
      return n > 0x7f ? "\\u" + n.toString(16).padStart(4, "0") : c;
    })
    .join("");

// Serialize { contract: folded } then strip the outer braces -> a 2-space-indented
// `"contract": { ... }` fragment ready to splice under the root object.
function contractFragment(folded) {
  const block = JSON.stringify({ contract: folded }, null, 2);
  const inner = block.slice(block.indexOf("\n") + 1, block.lastIndexOf("\n"));
  return escNonAscii(inner);
}

const envReport = [];
let folded = 0, skipped = 0, firstPreview = null;

for (const name of readdirSync(SLICES).sort()) {
  const dir = path.join(SLICES, name);
  const cp = path.join(dir, "slice.contract.ts");
  const jp = path.join(dir, "slice.json");
  if (!existsSync(cp) || !existsSync(jp)) continue;

  const c = await loadContract(cp);
  if (!c) { console.error(`x ${name}: no exported contract`); continue; }

  const jText = readFileSync(jp, "utf8");
  if (/^\s*"contract"\s*:/m.test(jText)) { skipped++; continue; }

  // Note (info only): env names already covered by deps.env — folded verbatim
  // anyway, normalized later alongside deps.
  const j = JSON.parse(jText);
  const depsEnv = new Set((j.deps?.env || []).map((e) => e.name));
  for (const e of c.requires?.env || []) if (!depsEnv.has(e)) envReport.push(`${name}:${e}`);

  // Build the folded block — VERBATIM except id/version (100% dup with
  // slice.json slug/version; dropping them collapses the version-trio to a pair).
  const block = {};
  if (c.requires) {
    const r = {};
    if (c.requires.auth) r.auth = c.requires.auth;
    if (c.requires.rbac?.length) r.rbac = c.requires.rbac;
    if (c.requires.env?.length) r.env = c.requires.env;
    if (c.requires.convex) r.convex = c.requires.convex;
    if (c.requires.deps?.length) r.deps = c.requires.deps; // verbatim, dirty — TODO normalize
    if (Object.keys(r).length) block.requires = r;
  }
  if (c.provides && Object.keys(c.provides).length) block.provides = c.provides;
  if (c.conflicts?.length) block.conflicts = c.conflicts;
  if (c.migrationFrom) block.migrationFrom = c.migrationFrom;
  if (c.generalization) block.generalization = c.generalization;

  const fragment = contractFragment(block);
  const next = jText.replace(/\n}\s*$/, `,\n${fragment}\n}\n`);
  if (next === jText) { console.error(`x ${name}: could not locate closing brace`); continue; }
  JSON.parse(next); // validate

  if (!firstPreview) firstPreview = { name, next };
  if (APPLY) writeFileSync(jp, next);
  folded++;
}

console.log(`${APPLY ? "applied" : "dry-run"}: ${folded} folded, ${skipped} already had contract`);
console.log(`env names in contract but NOT in deps.env (add by hand): ${envReport.length}` +
  (envReport.length ? `\n  ${envReport.join("\n  ")}` : ""));
if (!APPLY && firstPreview) {
  console.log(`\n--- preview: ${firstPreview.name}/slice.json (tail) ---`);
  console.log(firstPreview.next.split("\n").slice(-44).join("\n"));
}
