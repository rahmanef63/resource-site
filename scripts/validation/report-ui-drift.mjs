#!/usr/bin/env node
// WARN-ONLY report: drift between the two shadcn primitive trees.
// components/ui/ (site, modern "radix-ui" barrel) and
// template-base/components/ui/ (distributed with templates) are maintained
// by hand in parallel — this surfaces what diverged so syncs are a decision,
// not an accident. Never exits non-zero. Consolidated 2026-06-07 (content
// drift 0; both trees on the "radix-ui" barrel) — this report keeps it so.
//
// Run: node scripts/validation/report-ui-drift.mjs

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const SITE = path.join(ROOT, "components/ui");
const TPL = path.join(ROOT, "template-base/components/ui");

const list = (dir) =>
  existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
    : [];

const hash = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");

const site = new Set(list(SITE));
const tpl = new Set(list(TPL));

const onlySite = [...site].filter((f) => !tpl.has(f));
const onlyTpl = [...tpl].filter((f) => !site.has(f));
const drifted = [...site]
  .filter((f) => tpl.has(f))
  .filter((f) => hash(path.join(SITE, f)) !== hash(path.join(TPL, f)));

console.log(`ui-drift report — components/ui (${site.size}) vs template-base/components/ui (${tpl.size})`);
if (onlySite.length) console.log(`  site-only (${onlySite.length}): ${onlySite.sort().join(", ")}`);
if (onlyTpl.length) console.log(`  template-only (${onlyTpl.length}): ${onlyTpl.sort().join(", ")}`);
if (drifted.length) {
  console.log(`  content drift (${drifted.length}): ${drifted.sort().join(", ")}`);
} else {
  console.log("  content drift: none");
}
console.log("  (warn-only — trees consolidated 2026-06-07 on the unified \"radix-ui\" barrel; presence diffs are intentional: site-only = newer shadcn additions, template-only = template's toast/Marquee set)");
