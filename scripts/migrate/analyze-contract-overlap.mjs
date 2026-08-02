#!/usr/bin/env node
// analyze-contract-overlap.mjs — READ-ONLY. Quantify how slice.contract.ts data
// overlaps slice.json so the Phase-2 "full reconcile" schema can be designed
// with zero data loss. Surfaces, across all 70 slices, every datum that would
// NOT cleanly map when folding the contract into slice.json.
//
// Run: node scripts/migrate/analyze-contract-overlap.mjs

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const SLICES = path.join(REPO, "frontend", "slices");

// Eval the object literal passed to defineSliceContract(...). Pure data.
function loadContract(file) {
  const src = readFileSync(file, "utf8");
  const i = src.indexOf("defineSliceContract(");
  if (i < 0) return null;
  let depth = 0, start = -1;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === "{") { if (start < 0) start = j; depth++; }
    else if (c === "}") { depth--; if (depth === 0) {
      try { return new Function(`return (${src.slice(start, j + 1)});`)(); }
      catch (e) { return { __parseError: e.message }; }
    } }
  }
  return null;
}

const tally = {
  total: 0, withContract: 0,
  envNotInDepsEnv: [], depsNotInPeers: [], providesTablesNeConvexTables: [],
  hasConvexInContractNotJson: [], hasAuth: 0, hasRbac: 0, hasProvides: 0,
  hasConflicts: 0, hasMigrationFrom: 0, hasGeneralization: 0, hasRequiredProps: [],
  parseErrors: [],
};

for (const name of readdirSync(SLICES)) {
  const dir = path.join(SLICES, name);
  const cp = path.join(dir, "slice.contract.ts");
  const jp = path.join(dir, "slice.json");
  if (!existsSync(cp) || !existsSync(jp)) continue;
  tally.total++;
  const c = loadContract(cp);
  if (!c) continue;
  if (c.__parseError) { tally.parseErrors.push(`${name}: ${c.__parseError}`); continue; }
  tally.withContract++;
  const j = JSON.parse(readFileSync(jp, "utf8"));
  const req = c.requires || {}, prov = c.provides || {};
  const depsEnv = new Set((j.deps?.env || []).map((e) => e.name));
  const peers = new Set((j.deps?.peers || []).map((p) => p.slug));

  for (const e of req.env || []) if (!depsEnv.has(e)) tally.envNotInDepsEnv.push(`${name}:${e}`);
  for (const d of req.deps || []) if (!peers.has(d)) tally.depsNotInPeers.push(`${name}:${d}`);
  if (req.convex) {
    const ct = JSON.stringify((req.convex.tables || []).slice().sort());
    const pt = JSON.stringify((prov.tables || []).slice().sort());
    if ((prov.tables?.length || req.convex.tables?.length) && ct !== pt)
      tally.providesTablesNeConvexTables.push(`${name}: convex=${ct} provides=${pt}`);
    if (!j.convex || (!j.convex.tablesExport && !j.convex.schemaPath))
      tally.hasConvexInContractNotJson.push(name);
  }
  if (req.auth) tally.hasAuth++;
  if (req.rbac?.length) tally.hasRbac++;
  if (Object.keys(prov).length) tally.hasProvides++;
  if (c.conflicts?.length) tally.hasConflicts++;
  if (c.migrationFrom) tally.hasMigrationFrom++;
  if (c.generalization) tally.hasGeneralization++;
  if (c.generalization?.requiredProps?.length) tally.hasRequiredProps.push(name);
}

const show = (label, arr) =>
  console.log(`\n${label}: ${arr.length}` + (arr.length ? `\n  ${arr.join("\n  ")}` : ""));

console.log(`slices with contract+json: ${tally.withContract}/${tally.total}`);
console.log(`\nfield presence:`);
console.log(`  auth=${tally.hasAuth}  rbac=${tally.hasRbac}  provides=${tally.hasProvides}  conflicts=${tally.hasConflicts}  migrationFrom=${tally.hasMigrationFrom}  generalization=${tally.hasGeneralization}`);
show("⚠ contract env NOT in slice.json deps.env (would need merge)", tally.envNotInDepsEnv);
show("⚠ contract requires.deps NOT in slice.json deps.peers", tally.depsNotInPeers);
show("⚠ provides.tables != requires.convex.tables (can't collapse to one)", tally.providesTablesNeConvexTables);
show("⚠ contract has convex but slice.json convex empty", tally.hasConvexInContractNotJson);
show("· generalization.requiredProps present (new field, no json home)", tally.hasRequiredProps);
show("✖ parse errors", tally.parseErrors);
