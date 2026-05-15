#!/usr/bin/env node
/**
 * Wave N+3 — Forbidden-terms scanner.
 *
 * For every kitab `frontend/slices/<slug>/slice.contract.ts` that declares
 * `bidir.generalization.forbiddenTerms[]`, this script grep-scans the slice
 * source tree for any occurrence of those terms (case-insensitive, word-ish
 * boundary). Hits indicate consumer-specific business terms leaking into a
 * portable slice — which would block UP-sync via `/rr-send`.
 *
 * Scope:
 *   - Scans `.ts` `.tsx` `.js` `.jsx` `.mjs` files inside the slice dir.
 *   - SKIPS `slice.contract.ts` itself (the contract may legally name the
 *     forbidden term, e.g. doku-payment's `conflicts: ["midtrans-payment:..."]`).
 *   - SKIPS `node_modules/`, `.next/`, `dist/`, `coverage/`.
 *
 * Exit codes:
 *   0 — no slice has a forbidden-term hit (ignoring the contract file itself)
 *   1 — at least one hit
 *
 * Usage:
 *   node scripts/validation/check-forbidden-terms.mjs
 *   node scripts/validation/check-forbidden-terms.mjs --json
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..", "..");
const SLICES_DIR = join(ROOT, "frontend", "slices");
const JSON_MODE = process.argv.includes("--json");

const FORBIDDEN_RE = /\bforbiddenTerms\s*:\s*\[([^\]]*)\]/;
const SCAN_EXT = /\.(tsx?|jsx?|mjs)$/;
const SKIP_DIR = new Set(["node_modules", ".next", "dist", "coverage", ".turbo"]);

function color(c, str) {
  if (JSON_MODE || !process.stdout.isTTY) return str;
  const codes = { red: 31, green: 32, yellow: 33, cyan: 36, dim: 2 };
  return `\x1b[${codes[c] ?? 0}m${str}\x1b[0m`;
}

function extractForbiddenTerms(src) {
  const m = src.match(FORBIDDEN_RE);
  if (!m) return [];
  const inner = m[1];
  const terms = [...inner.matchAll(/["']([^"']+)["']/g)].map((x) => x[1]);
  return terms;
}

async function walk(dir, out) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIR.has(e.name)) continue;
      await walk(join(dir, e.name), out);
    } else if (e.isFile() && SCAN_EXT.test(e.name)) {
      out.push(join(dir, e.name));
    }
  }
}

function termRegex(term) {
  // Match identifier-ish boundary on both sides; case-insensitive.
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^a-zA-Z0-9_])${escaped}(?:[^a-zA-Z0-9_]|$)`, "i");
}

async function scanSlice(sliceDir, slug, terms) {
  const files = [];
  await walk(sliceDir, files);
  const hits = [];
  for (const f of files) {
    if (f.endsWith("slice.contract.ts")) continue;
    if (f.endsWith(".kitab.json")) continue;
    let src;
    try {
      src = await readFile(f, "utf8");
    } catch {
      continue;
    }
    const lines = src.split("\n");
    for (const term of terms) {
      const re = termRegex(term);
      for (let i = 0; i < lines.length; i++) {
        const stripped = lines[i].trim();
        // Skip comment-only lines: `//`, `/* */`, ` * ` (JSDoc continuation).
        // Cross-provider "see also" references in comments are legit
        // documentation, not business-term leakage. Identifier-level uses
        // in real code still trip the regex.
        if (
          stripped.startsWith("//") ||
          stripped.startsWith("/*") ||
          stripped.startsWith("*") ||
          stripped.startsWith("*/")
        ) {
          continue;
        }
        if (re.test(lines[i])) {
          hits.push({
            slug,
            term,
            file: f.slice(ROOT.length + 1),
            line: i + 1,
            preview: lines[i].trim().slice(0, 100),
          });
        }
      }
    }
  }
  return hits;
}

async function main() {
  if (!existsSync(SLICES_DIR)) {
    if (JSON_MODE) {
      process.stdout.write(JSON.stringify({ error: "no slices dir" }));
    } else {
      console.error(color("red", `No slices dir at ${SLICES_DIR}`));
    }
    process.exit(0);
  }
  const entries = await readdir(SLICES_DIR, { withFileTypes: true });
  const allHits = [];
  let scannedSlices = 0;
  let slicesWithForbidden = 0;

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const slug = entry.name;
    const sliceDir = join(SLICES_DIR, slug);
    const contractPath = join(sliceDir, "slice.contract.ts");
    if (!existsSync(contractPath)) continue;
    scannedSlices++;
    const src = await readFile(contractPath, "utf8");
    const terms = extractForbiddenTerms(src);
    if (terms.length === 0) continue;
    slicesWithForbidden++;
    const hits = await scanSlice(sliceDir, slug, terms);
    allHits.push(...hits);
  }

  if (JSON_MODE) {
    process.stdout.write(
      JSON.stringify(
        {
          scannedSlices,
          slicesWithForbiddenTerms: slicesWithForbidden,
          hitCount: allHits.length,
          hits: allHits,
        },
        null,
        2,
      ),
    );
    process.exit(allHits.length > 0 ? 1 : 0);
  }

  console.log(color("cyan", `\n== forbidden-terms scan ==`));
  console.log(
    color("dim", `${scannedSlices} slice(s) scanned · ${slicesWithForbidden} declare forbiddenTerms`),
  );
  if (allHits.length === 0) {
    console.log(color("green", "\n✓ no forbidden-term hits"));
    console.log("");
    process.exit(0);
  }
  console.log("");
  for (const h of allHits) {
    console.log(
      `  ${color("red", "✖")} ${color("cyan", h.slug)} term=${color("yellow", h.term)} @ ${h.file}:${h.line}`,
    );
    console.log(`      ${color("dim", h.preview)}`);
  }
  console.log("");
  console.log(color("red", `${allHits.length} hit(s) — generalisation gate violation`));
  console.log("");
  process.exit(1);
}

main().catch((err) => {
  console.error(`forbidden-terms scanner crashed: ${err.stack || err}`);
  process.exit(2);
});
