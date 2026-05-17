#!/usr/bin/env node
// audit-templates.mjs — template-scope audit-bp pass.
//
// Templates (lib/content/layouts.ts) ship as monolithic Next.js scaffolds
// at `app/preview/<slug>/` (+ optional `components/templates/<base>/` and
// `convex-templates/<slug>/`). They are installed by CLI's addLayout flow
// which, under default `--at root`, runs `rewritePreviewPaths()` over a
// FIXED list of files (robots.ts, sitemap.ts, per-template-base
// nav-config.ts + site-config.ts). Any hardcoded `/preview/<slug>` URL
// OUTSIDE that list will leak into the consumer install.
//
// What this guard enforces:
//   1. shadcn primitives only — no raw <button>, <dialog>,
//      <input type="date|file"> in template tsx files.
//   2. /preview/<slug> only inside the rewriter's candidate list (or in
//      *.md / README / config arrays consumed by build tooling).
//
// No external deps. Run: node scripts/validation/audit-templates.mjs

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const LAYOUTS_FILE = path.join(REPO, "lib", "content", "layouts.ts");

// Files the CLI rewriter handles — hardcoded /preview/<slug> tokens here
// are EXPECTED (rewriter rewrites them on --at root install). Anywhere else
// they leak into the consumer install verbatim.
const REWRITER_FILE_NAMES = new Set([
  "robots.ts",
  "sitemap.ts",
  "site-config.ts",
  "nav-config.ts",
]);

const errors = [];
const warnings = [];

const slugs = extractLayoutSlugs(LAYOUTS_FILE);
if (slugs.length === 0) {
  console.error("✖ audit-templates: no layout slugs found in lib/content/layouts.ts");
  process.exit(1);
}

const TEMPLATE_ROOTS = [
  ...slugs.map((s) => path.join(REPO, "app", "preview", s)),
  path.join(REPO, "components", "templates"),
  // Cookbook layouts — shipped via `repoPath: "cookbook/layouts/<slug>"` in
  // lib/content/layouts.ts. Real ship code; same rules as components/templates/.
  path.join(REPO, "cookbook", "layouts"),
  // Per-slice preview demos. Sandbox docs surface, but still consumer-facing
  // and a leak path for shadcn-rule violations into example code consumers
  // copy. Treat as warnings (not blockers) since they're not in the install
  // payload — but we want visibility.
  path.join(REPO, "app", "preview", "slices"),
];

// A "real template" is one that ships public + admin route trees (e.g.
// personal-brand-os, agency-studio-os). A "block-demo template" is a
// single-page cookbook showcase (e.g. landing-bento, pricing-toggle).
// Real templates get distributed verbatim to consumers — raw shadcn-rule
// violations there are blockers. Block demos are docs-surface flair —
// fixing them is a backlog (warned, not failed).
function isRealTemplate(slug) {
  const previewDir = path.join(REPO, "app", "preview", slug);
  if (!existsSync(previewDir)) return false;
  return (
    existsSync(path.join(previewDir, "public")) ||
    existsSync(path.join(previewDir, "admin"))
  );
}

function slugForFile(file) {
  // Pull `app/preview/<slug>/...` from file path. Returns null for
  // components/templates/<base>/... (always treated as real template since
  // base dirs only exist for real-template scaffolds).
  const rel = path.relative(REPO, file);
  const parts = rel.split(path.sep);
  if (parts[0] === "app" && parts[1] === "preview" && parts[2]) return parts[2];
  return null;
}

function severityFor(file) {
  const rel = path.relative(REPO, file);
  const parts = rel.split(path.sep);
  // app/preview/slices/<slug>/* → sandbox docs surface, warning only
  if (parts[0] === "app" && parts[1] === "preview" && parts[2] === "slices") {
    return "warning";
  }
  // cookbook/layouts/<slug>/* → real ship code, blocker
  if (parts[0] === "cookbook" && parts[1] === "layouts") {
    return "error";
  }
  // components/templates/* → real ship code, blocker
  if (parts[0] === "components" && parts[1] === "templates") {
    return "error";
  }
  // app/preview/<slug>/* (non-slices) → use existing real-template logic
  const slug = slugForFile(file);
  if (slug) return isRealTemplate(slug) ? "error" : "warning";
  return "error";
}

let scanned = 0;
for (const root of TEMPLATE_ROOTS) {
  if (!existsSync(root)) continue;
  for (const file of findTsxFiles(root)) {
    scanned++;
    const body = readFileSync(file, "utf8");
    const rel = path.relative(REPO, file);
    const base = path.basename(file);
    const severity = severityFor(file);
    const sink = severity === "error" ? errors : warnings;

    // Rule 1 — shadcn primitives only.
    if (base !== "button.tsx" && base !== "dialog.tsx") {
      checkRaw(body, /<button(\s|>)/g, "raw <button> — wrap in shadcn <Button>", rel, sink);
      checkRaw(body, /<dialog(\s|>)/g, "raw <dialog> — wrap in shadcn <Dialog> / ResponsiveDialog", rel, sink);
      checkRaw(body, /<input[^>]*type=["']date["']/g, 'raw <input type="date"> — use DateField', rel, sink);
      checkRaw(body, /<input[^>]*type=["']file["']/g, 'raw <input type="file"> — use FileUpload', rel, sink);
    }

    // Rule 2 — /preview/<slug> only in rewriter-handled files. Always an
    // error: leaks to consumer install regardless of template kind.
    if (!REWRITER_FILE_NAMES.has(base)) {
      for (const s of slugs) {
        const needle = `/preview/${s}`;
        if (body.includes(needle)) {
          errors.push(
            `[${s}] hardcoded "${needle}" in ${rel} — rewriter only touches ${[...REWRITER_FILE_NAMES].join("/")}; move the constant or extend rewriter`,
          );
        }
      }
    }
  }
}

if (errors.length === 0 && warnings.length === 0) {
  console.log(`✓ audit-templates: ${scanned} file(s) across ${slugs.length} template(s) OK`);
  process.exit(0);
}

if (warnings.length > 0) {
  console.log(`⚠ ${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  · ${w}`);
}
if (errors.length > 0) {
  console.error(`\n✖ ${errors.length} error(s):`);
  for (const e of errors) console.error(`  · ${e}`);
}
process.exit(errors.length > 0 ? 1 : 0);

// ───────────────────────────────────────────────────────────────────

function checkRaw(body, re, message, rel, sink) {
  const templateRanges = templateLiteralRanges(body);
  let m;
  while ((m = re.exec(body)) !== null) {
    if (isInsideRange(m.index, templateRanges)) continue;
    const before = body.slice(0, m.index);
    const line = before.split("\n").length;
    sink.push(`${message} at ${rel}:${line}`);
  }
}

// Track [start, end] char ranges of every backtick-delimited template
// literal. Match indices that fall inside one are documentation strings
// (e.g. <CodeBlock>{`<button>example</button>`}</CodeBlock>) — skip.
// Ignores escaped backticks (rare in TSX).
function templateLiteralRanges(body) {
  const ranges = [];
  let inTpl = false, tStart = 0;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === "`" && body[i - 1] !== "\\") {
      if (inTpl) {
        ranges.push([tStart, i]);
        inTpl = false;
      } else {
        tStart = i;
        inTpl = true;
      }
    }
  }
  return ranges;
}

function isInsideRange(idx, ranges) {
  for (const [a, b] of ranges) {
    if (idx >= a && idx <= b) return true;
  }
  return false;
}

function findTsxFiles(dir) {
  const out = [];
  let names;
  try { names = readdirSync(dir); } catch { return out; }
  for (const name of names) {
    if (name === "node_modules" || name === ".next") continue;
    const full = path.join(dir, name);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) out.push(...findTsxFiles(full));
    else if (/\.(tsx|ts)$/.test(name)) out.push(full);
  }
  return out;
}

function extractLayoutSlugs(file) {
  if (!existsSync(file)) return [];
  const body = readFileSync(file, "utf8");
  const out = [];
  for (const m of body.matchAll(/^\s*slug:\s*"([^"]+)"/gm)) {
    out.push(m[1]);
  }
  return [...new Set(out)];
}
