// audit-templates-helpers.mjs — pure helpers extracted from
// audit-templates.mjs to keep both files ≤200 LOC.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export function slugForFile(file, repoRoot) {
  const rel = path.relative(repoRoot, file);
  const parts = rel.split(path.sep);
  if (parts[0] === "app" && parts[1] === "preview" && parts[2]) return parts[2];
  return null;
}

// A "real template" is one that ships public + admin route trees (e.g.
// personal-brand-os, agency-studio-os). A "block-demo template" is a
// single-page cookbook showcase (e.g. landing-bento, pricing-toggle).
// Real templates get distributed verbatim to consumers — raw shadcn-rule
// violations there are blockers. Block demos are docs-surface flair —
// fixing them is a backlog (warned, not failed).
export function isRealTemplate(slug, repoRoot) {
  const previewDir = path.join(repoRoot, "app", "preview", slug);
  if (!existsSync(previewDir)) return false;
  return (
    existsSync(path.join(previewDir, "public")) ||
    existsSync(path.join(previewDir, "admin"))
  );
}

export function severityFor(file, repoRoot) {
  const rel = path.relative(repoRoot, file);
  const parts = rel.split(path.sep);
  // app/preview/slices/<slug>/* → sandbox docs surface, warning only
  if (parts[0] === "app" && parts[1] === "preview" && parts[2] === "slices") {
    return "warning";
  }
  // frontend/slices/<slug>/* → slice source (copied into consumers by
  // `rr add`). HARD GATE (2026-06-02): burndown complete — 66 raw <button>
  // converted to shadcn Button, 7 raw <input type=file> moved behind the
  // FilePicker primitive (@/shared/ui/FilePicker). Any new raw primitive in
  // slice source now fails CI; use a shadcn primitive or wrap the native
  // element in a shared/ primitive (shared/ is out of scope by design).
  if (parts[0] === "frontend" && parts[1] === "slices") {
    return "error";
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
  const slug = slugForFile(file, repoRoot);
  if (slug) return isRealTemplate(slug, repoRoot) ? "error" : "warning";
  return "error";
}

export function findTsxFiles(dir) {
  const out = [];
  let names;
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of names) {
    if (name === "node_modules" || name === ".next") continue;
    const full = path.join(dir, name);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) out.push(...findTsxFiles(full));
    else if (/\.(tsx|ts)$/.test(name)) out.push(full);
  }
  return out;
}

export function extractLayoutSlugs(file) {
  if (!existsSync(file)) return [];
  const body = readFileSync(file, "utf8");
  const out = [];
  for (const m of body.matchAll(/^\s*slug:\s*"([^"]+)"/gm)) {
    out.push(m[1]);
  }
  return [...new Set(out)];
}

/** Extract slugs whose entry has `category: "website-template"`. Used by
 *  the pages-CRUD gate to require the canonical admin/pages surface on
 *  full-app templates. */
export function extractWebsiteTemplateSlugs(file) {
  if (!existsSync(file)) return [];
  const body = readFileSync(file, "utf8");
  const out = [];
  // Walk each top-level entry block, look for slug + category="website-template".
  const blockRe = /\{\s*slug:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"/g;
  for (const m of body.matchAll(blockRe)) {
    if (m[2] === "website-template") out.push(m[1]);
  }
  return [...new Set(out)];
}

// Track [start, end] char ranges of every backtick-delimited template
// literal. Match indices that fall inside one are documentation strings
// (e.g. <CodeBlock>{`<button>example</button>`}</CodeBlock>) — skip.
// Ignores escaped backticks (rare in TSX).
export function templateLiteralRanges(body) {
  const ranges = [];
  let inTpl = false,
    tStart = 0;
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

export function isInsideRange(idx, ranges) {
  for (const [a, b] of ranges) {
    if (idx >= a && idx <= b) return true;
  }
  return false;
}

export function checkRaw(body, re, message, rel, sink) {
  const templateRanges = templateLiteralRanges(body);
  let m;
  while ((m = re.exec(body)) !== null) {
    if (isInsideRange(m.index, templateRanges)) continue;
    const before = body.slice(0, m.index);
    const line = before.split("\n").length;
    sink.push(`${message} at ${rel}:${line}`);
  }
}
