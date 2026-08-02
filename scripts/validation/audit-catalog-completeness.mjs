#!/usr/bin/env node
// Ad-hoc audit for catalog completeness (slices + layouts).
// Not wired into CI — invoked manually during catalog sweeps.
import path from "node:path";
import { ROOT, loadCatalog, auditEntry } from "./audit-catalog-helpers.mjs";

async function main() {
  const slices = await loadCatalog(path.join(ROOT, "lib", "content", "slices.ts"), "slices");
  const layouts = await loadCatalog(path.join(ROOT, "lib", "content", "layouts.ts"), "layouts");

  const counters = {
    missingDefaultView: { slices: 0, layouts: 0 },
    missingDefaultZoom: { slices: 0, layouts: 0 },
    missingAgentRecipe: { slices: 0, layouts: 0 },
    missingTags: { slices: 0, layouts: 0 },
    missingSource: { slices: 0, layouts: 0 },
    missingPreviewPath: { slices: 0, layouts: 0 },
    descTooShort: { slices: 0, layouts: 0 },
    agentRecipeStale: { slices: 0, layouts: 0 },
    agentRecipeNoNpx: { slices: 0, layouts: 0 },
    previewPathBroken: { slices: 0, layouts: 0 },
  };
  const perEntry = [];

  for (const [list, kind] of [[slices, "slice"], [layouts, "layout"]]) {
    for (const entry of list) {
      const v = auditEntry(entry);
      const bucket = kind === "slice" ? "slices" : "layouts";
      for (const w of v.warnings) {
        if (w.includes("defaultView")) counters.missingDefaultView[bucket]++;
        if (w.includes("defaultZoom")) counters.missingDefaultZoom[bucket]++;
        if (w.includes("agentRecipe") && !w.includes("ref")) counters.missingAgentRecipe[bucket]++;
        if (w.includes("tags")) counters.missingTags[bucket]++;
        if (w.includes("source")) counters.missingSource[bucket]++;
        if (w.includes("previewPath")) counters.missingPreviewPath[bucket]++;
      }
      for (const e of v.errors) {
        if (e.includes("description too short")) counters.descTooShort[bucket]++;
      }
      for (const a of v.accuracy) {
        if (a.includes("template-base/") || a.includes("cp -r")) counters.agentRecipeStale[bucket]++;
        if (a.includes("missing 'npx rr add'")) counters.agentRecipeNoNpx[bucket]++;
        if (a.includes("does not resolve")) counters.previewPathBroken[bucket]++;
      }
      if (v.errors.length || v.warnings.length || v.accuracy.length) {
        perEntry.push({ kind, slug: entry.slug, ...v });
      }
    }
  }

  const fmt = (n) => String(n).padStart(3, " ");
  console.log("\n═══════════ CATALOG AUDIT ═══════════");
  console.log(`Total entries: ${slices.length} slices + ${layouts.length} layouts = ${slices.length + layouts.length}\n`);
  console.log("Per-field missing counts:");
  console.log(`              slices  layouts`);
  for (const k of Object.keys(counters)) {
    console.log(`  ${k.padEnd(22)} ${fmt(counters[k].slices)}     ${fmt(counters[k].layouts)}`);
  }

  console.log("\nPer-entry violations:");
  for (const p of perEntry) {
    const flags = [];
    if (p.errors.length) flags.push("E:" + p.errors.join("; "));
    if (p.warnings.length) flags.push("W:" + p.warnings.join("; "));
    if (p.accuracy.length) flags.push("A:" + p.accuracy.join("; "));
    console.log(`  [${p.kind}] ${p.slug.padEnd(30)} ${flags.join(" | ")}`);
  }

  const totalErrors = perEntry.reduce((a, p) => a + p.errors.length, 0);
  const totalWarn = perEntry.reduce((a, p) => a + p.warnings.length, 0);
  const totalAcc = perEntry.reduce((a, p) => a + p.accuracy.length, 0);
  console.log(`\nTotals: ${totalErrors} errors, ${totalWarn} warnings, ${totalAcc} accuracy issues`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
