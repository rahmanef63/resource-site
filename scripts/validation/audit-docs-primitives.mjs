#!/usr/bin/env node
// audit-docs-primitives.mjs — docs-site DRY nudge (ADVISORY, never fails).
//
// After Q3 we have `<DocCard>` (components/site/doc-primitives.tsx) owning the
// docs panel chrome `rounded-lg border bg-card`. This guard flags any NEW raw
// `<div … rounded-lg border bg-card …>` in app/(docs) so panels keep going
// through DocCard (one restyle source) instead of re-inlining the chrome.
//
// Scope is deliberately narrow:
//   - only `<div …>` openers (Link / <details> panels legitimately keep the
//     chrome inline — DocCard is a div, so it can't replace them)
//   - only app/(docs) (DocCard is docs-site-internal; consumer slices can't
//     import it, so flagging slices would be wrong)
//
// Exit 0 ALWAYS — this is a recommendation, not a gate. Run:
//   node scripts/validation/audit-docs-primitives.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const SCAN_ROOT = path.join(REPO, "app/(docs)");

// `<div …rounded-lg border bg-card…>` on a single line. Link/details openers
// don't match (different tag), so they're skipped by construction.
const PANEL_DIV = /<div\b[^>]*\brounded-lg border bg-card\b/;

const hits = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
    } else if (/\.tsx$/.test(entry)) {
      const lines = readFileSync(full, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (PANEL_DIV.test(line)) {
          hits.push({ file: path.relative(REPO, full), ln: i + 1 });
        }
      });
    }
  }
}

walk(SCAN_ROOT);

if (hits.length === 0) {
  console.log("✓ audit-docs-primitives: no raw panel-chrome <div> in app/(docs)");
} else {
  console.log(`⚠ audit-docs-primitives: ${hits.length} raw panel <div> — prefer <DocCard> (components/site/doc-primitives):`);
  for (const h of hits) {
    console.log(`  • ${h.file}:${h.ln}`);
  }
  console.log("  (advisory — replace `<div className=\"rounded-lg border bg-card …\">` with `<DocCard className=\"…\">`)");
}

process.exit(0);
