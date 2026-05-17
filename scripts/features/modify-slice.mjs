#!/usr/bin/env node
// modify-slice.mjs — patch metadata of an existing slice in both
// frontend/slices/<slug>/slice.json AND lib/content/slices.ts.
//
// Run:
//   npm run modify:slice -- --slug doku-payment --add-npm "doku-node-library@^2"
//   npm run modify:slice -- --slug doku-payment --add-shadcn dialog,toast
//   npm run modify:slice -- --slug doku-payment --add-tag indonesia,checkout
//   npm run modify:slice -- --slug doku-payment --add-peer convex-auth@^0.1
//   npm run modify:slice -- --slug doku-payment --add-env DOKU_CLIENT_ID:convex:required
//   npm run modify:slice -- --slug doku-payment --bump patch|minor|major
//   npm run modify:slice -- --slug doku-payment --set-description "..."
//   npm run modify:slice -- --slug doku-payment --set-docs https://...
//
// Combine flags freely. After patching it runs `npm run slices:check`.
//
// Internals: helpers in ./modify-slice-helpers.mjs, per-flag ops in
// ./modify-slice-ops.mjs.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseArgs, locateEntry } from "./modify-slice-helpers.mjs";
import { applyOps } from "./modify-slice-ops.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const SLICES_TS = path.join(REPO, "lib/content/slices.ts");

const args = parseArgs(process.argv.slice(2));

if (!args.slug) {
  console.error("Usage: npm run modify:slice -- --slug <slug> [flags]");
  console.error("\nFlags:");
  console.error("  --add-npm pkg@^v[,pkg2@^v]      Add npm package(s)");
  console.error("  --add-shadcn name[,name]        Add shadcn component(s)");
  console.error("  --add-tag tag[,tag]             Add tag(s)");
  console.error("  --add-peer slug@range[,...]     Add peer slice(s)");
  console.error("  --add-env NAME:scope[:required] Add an env var (scope=convex|next-public|server)");
  console.error("  --add-provider name             Add a provider sub-folder name");
  console.error("  --bump patch|minor|major        Semver bump");
  console.error("  --set-description \"...\"        Replace description");
  console.error("  --set-docs <url>                Replace docsUrl");
  console.error("  --set-install \"npm i ...\"      Replace install line");
  process.exit(1);
}

const slug = args.slug;
if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(slug)) {
  fail(`Slug must be kebab-case (got "${slug}").`);
}
const sliceJsonPath = path.join(REPO, "frontend/slices", slug, "slice.json");
if (!existsSync(sliceJsonPath)) fail(`No slice at frontend/slices/${slug}/slice.json. Run 'npm run new:slice' first.`);

const sliceJson = JSON.parse(readFileSync(sliceJsonPath, "utf8"));
const tsSrc = readFileSync(SLICES_TS, "utf8");
const entryRange = locateEntry(tsSrc, slug);
if (!entryRange) fail(`No SliceEntry for "${slug}" in lib/content/slices.ts. Add a stub manually first or re-run scaffold.`);

let entryBody = tsSrc.slice(entryRange.start, entryRange.end);
const ops = [];
entryBody = applyOps({ args, sliceJson, entryBody, ops, fail });

if (ops.length === 0) {
  console.log("No changes requested. Pass at least one flag.");
  process.exit(0);
}

writeFileSync(sliceJsonPath, JSON.stringify(sliceJson, null, 2) + "\n");
const nextTs = tsSrc.slice(0, entryRange.start) + entryBody + tsSrc.slice(entryRange.end);
writeFileSync(SLICES_TS, nextTs);

console.log(`\n→ Modified ${slug}:`);
for (const o of ops) console.log(`  · ${o}`);

console.log(`\n→ Regenerating registries + validating\n`);
try {
  execSync("npm run gen:slices && npm run validate:slices && npm run audit:slices", { cwd: REPO, stdio: "inherit" });
} catch {
  console.error(`\n✖ validation failed. Review the changes above.`);
  process.exit(1);
}
console.log(`\n✓ Done. Run 'npm run manifest:sync' before commit.\n`);

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}
