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
// Pure helpers (findTsxFiles, extractLayoutSlugs, severityFor, checkRaw,
// templateLiteralRanges, isInsideRange) live in audit-templates-helpers.mjs
// to keep this file ≤200 LOC.

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  checkRaw,
  extractLayoutSlugs,
  extractWebsiteTemplateSlugs,
  findTsxFiles,
  severityFor,
} from "./audit-templates-helpers.mjs";

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
  console.error(
    "✖ audit-templates: no layout slugs found in lib/content/layouts.ts",
  );
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

let scanned = 0;
for (const root of TEMPLATE_ROOTS) {
  if (!existsSync(root)) continue;
  for (const file of findTsxFiles(root)) {
    scanned++;
    const body = readFileSync(file, "utf8");
    const rel = path.relative(REPO, file);
    const base = path.basename(file);
    const severity = severityFor(file, REPO);
    const sink = severity === "error" ? errors : warnings;

    // Rule 1 — shadcn primitives only.
    if (base !== "button.tsx" && base !== "dialog.tsx") {
      checkRaw(
        body,
        /<button(\s|>)/g,
        "raw <button> — wrap in shadcn <Button>",
        rel,
        sink,
      );
      checkRaw(
        body,
        /<dialog(\s|>)/g,
        "raw <dialog> — wrap in shadcn <Dialog> / ResponsiveDialog",
        rel,
        sink,
      );
      checkRaw(
        body,
        /<input[^>]*type=["']date["']/g,
        'raw <input type="date"> — use DateField',
        rel,
        sink,
      );
      checkRaw(
        body,
        /<input[^>]*type=["']file["']/g,
        'raw <input type="file"> — use FileUpload',
        rel,
        sink,
      );
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

// Rule 3 — every website-template must expose the Pages CRUD surface.
// Required files (P-wave, 2026-05-18):
//   app/preview/<slug>/admin/pages/page.tsx
//   app/preview/<slug>/admin/pages/[id]/page.tsx
//   app/preview/<slug>/public/[...slug]/page.tsx
const wtSlugs = extractWebsiteTemplateSlugs(LAYOUTS_FILE);
for (const wt of wtSlugs) {
  const required = [
    `app/preview/${wt}/admin/pages/page.tsx`,
    `app/preview/${wt}/admin/pages/[id]/page.tsx`,
    `app/preview/${wt}/public/[...slug]/page.tsx`,
  ];
  for (const rel of required) {
    if (!existsSync(path.join(REPO, rel))) {
      errors.push(
        `[${wt}] missing Pages CRUD surface: ${rel} — every website-template must wire admin/pages + public catch-all (see saas-marketing-os POC, commit 3768678)`,
      );
    }
  }
}

if (errors.length === 0 && warnings.length === 0) {
  console.log(
    `✓ audit-templates: ${scanned} file(s) across ${slugs.length} template(s) OK; ${wtSlugs.length} website-template(s) have Pages CRUD`,
  );
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
