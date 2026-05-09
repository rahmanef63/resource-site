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

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

// ─── npm ───
if (args["add-npm"]) {
  const pkgs = csv(args["add-npm"]);
  sliceJson.deps = sliceJson.deps ?? {};
  sliceJson.deps.npm = uniqMerge(sliceJson.deps.npm ?? [], pkgs);
  entryBody = patchArrayField(entryBody, "npm", sliceJson.deps.npm);
  ops.push(`npm += ${pkgs.join(", ")}`);
}

// ─── shadcn ───
if (args["add-shadcn"]) {
  const names = csv(args["add-shadcn"]);
  sliceJson.deps = sliceJson.deps ?? {};
  sliceJson.deps.shadcn = uniqMerge(sliceJson.deps.shadcn ?? [], names);
  entryBody = patchArrayField(entryBody, "shadcn", sliceJson.deps.shadcn);
  ops.push(`shadcn += ${names.join(", ")}`);
}

// ─── tags ───
if (args["add-tag"]) {
  const tags = csv(args["add-tag"]);
  sliceJson.tags = uniqMerge(sliceJson.tags ?? [], tags);
  entryBody = patchArrayField(entryBody, "tags", sliceJson.tags);
  ops.push(`tags += ${tags.join(", ")}`);
}

// ─── peers ───
if (args["add-peer"]) {
  const peers = csv(args["add-peer"]).map((p) => {
    const [pSlug, range] = p.split("@");
    if (!pSlug || !range) fail(`--add-peer expects slug@range (got "${p}")`);
    return { slug: pSlug, range };
  });
  sliceJson.deps = sliceJson.deps ?? {};
  sliceJson.deps.peers = mergeBy(sliceJson.deps.peers ?? [], peers, "slug");
  entryBody = patchObjectArrayField(entryBody, "peers", sliceJson.deps.peers);
  ops.push(`peers += ${peers.map((p) => `${p.slug}@${p.range}`).join(", ")}`);
}

// ─── env ───
if (args["add-env"]) {
  const [name, scope, req] = String(args["add-env"]).split(":");
  if (!name || !scope) fail(`--add-env expects NAME:scope[:required]`);
  const required = req === "required";
  const envEntry = { name, scope, ...(required ? { required: true } : {}) };
  sliceJson.deps = sliceJson.deps ?? {};
  sliceJson.deps.env = mergeBy(sliceJson.deps.env ?? [], [envEntry], "name");
  entryBody = patchObjectArrayField(entryBody, "env", sliceJson.deps.env);
  ops.push(`env += ${name}(${scope}${required ? ",required" : ""})`);
}

// ─── providers ───
if (args["add-provider"]) {
  const p = String(args["add-provider"]);
  sliceJson.providers = uniqMerge(sliceJson.providers ?? [], [p]);
  entryBody = patchArrayField(entryBody, "providers", sliceJson.providers);
  ops.push(`providers += ${p}`);
}

// ─── bump version ───
if (args.bump) {
  const next = bumpSemver(sliceJson.version, args.bump);
  sliceJson.version = next;
  entryBody = patchStringField(entryBody, "version", next);
  ops.push(`version → ${next}`);
}

// ─── set fields ───
if (args["set-description"]) {
  sliceJson.description = String(args["set-description"]);
  entryBody = patchStringField(entryBody, "description", sliceJson.description);
  ops.push(`description set`);
}
if (args["set-docs"]) {
  entryBody = patchStringField(entryBody, "docsUrl", String(args["set-docs"]));
  ops.push(`docsUrl set`);
}
if (args["set-install"]) {
  entryBody = patchStringField(entryBody, "install", String(args["set-install"]));
  ops.push(`install set`);
}

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

// ─── helpers ───────────────────────────────────────────────────────────

function locateEntry(src, slug) {
  // Find `slug: "<slug>",` then walk back to the opening `{` and forward to its matching `}`.
  const needle = `slug: "${slug}"`;
  const slugIdx = src.indexOf(needle);
  if (slugIdx === -1) return null;
  // Find opening `{` before slugIdx (within the slices array).
  let i = slugIdx;
  while (i > 0 && src[i] !== "{") i--;
  if (src[i] !== "{") return null;
  const start = i;
  // Walk forward matching braces.
  let depth = 0;
  for (let j = start; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") {
      depth--;
      if (depth === 0) {
        // Include trailing comma + newline if present.
        let end = j + 1;
        if (src[end] === ",") end++;
        if (src[end] === "\n") end++;
        return { start, end };
      }
    }
  }
  return null;
}

function patchArrayField(body, field, values) {
  const literal = `[${values.map((v) => JSON.stringify(v)).join(", ")}]`;
  // Use bracket walker so values containing `]` (escaped strings, nested
  // arrays) don't short-circuit. Mirror patchObjectArrayField shape.
  const startRe = new RegExp(`\\b${field}\\s*:\\s*\\[`);
  const m = body.match(startRe);
  if (!m) return insertField(body, `${field}: ${literal}`);
  const start = m.index + m[0].length - 1;
  const end = matchBracket(body, start, "[", "]");
  if (end === -1) return insertField(body, `${field}: ${literal}`);
  return body.slice(0, start) + literal + body.slice(end + 1);
}

function patchObjectArrayField(body, field, values) {
  const literal = serializeObjectArray(values);
  // Match `field: [` … `]` allowing nested objects.
  const startRe = new RegExp(`\\b${field}\\s*:\\s*\\[`);
  const m = body.match(startRe);
  if (!m) return insertField(body, `${field}: ${literal}`);
  const start = m.index + m[0].length - 1;
  const end = matchBracket(body, start, "[", "]");
  if (end === -1) return insertField(body, `${field}: ${literal}`);
  return body.slice(0, start) + literal + body.slice(end + 1);
}

function patchStringField(body, field, value) {
  const literal = JSON.stringify(value);
  const re = new RegExp(`(\\b${field}\\s*:\\s*)"[^"]*"`);
  if (re.test(body)) return body.replace(re, `$1${literal}`);
  return insertField(body, `${field}: ${literal}`);
}

function insertField(body, kvLine) {
  // Insert before the closing `},` of this object.
  const closeIdx = body.lastIndexOf("}");
  if (closeIdx === -1) return body;
  const before = body.slice(0, closeIdx);
  const after = body.slice(closeIdx);
  // Detect indent of the last property line.
  const indent = (before.match(/\n(\s+)[a-zA-Z]+:/g) ?? ["    "]).pop()?.match(/\n(\s+)/)?.[1] ?? "    ";
  return `${before}${indent}${kvLine},\n${" ".repeat(Math.max(0, indent.length - 2))}${after}`;
}

function matchBracket(body, openIdx, open, close) {
  let depth = 0;
  for (let i = openIdx; i < body.length; i++) {
    if (body[i] === open) depth++;
    else if (body[i] === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function serializeObjectArray(arr) {
  if (arr.length === 0) return "[]";
  const parts = arr.map((o) => {
    const fields = Object.entries(o)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join(", ");
    return `{ ${fields} }`;
  });
  return `[${parts.join(", ")}]`;
}

function uniqMerge(a, b) {
  return [...new Set([...a, ...b])];
}

function mergeBy(a, b, key) {
  const out = [...a];
  for (const item of b) {
    const idx = out.findIndex((x) => x[key] === item[key]);
    if (idx === -1) out.push(item);
    else out[idx] = { ...out[idx], ...item };
  }
  return out;
}

function bumpSemver(v, level) {
  const m = String(v).match(/^(\d+)\.(\d+)\.(\d+)(?:-.*)?$/);
  if (!m) fail(`Invalid semver: "${v}"`);
  let [_, maj, min, pat] = m;
  maj = +maj; min = +min; pat = +pat;
  if (level === "major") { maj++; min = 0; pat = 0; }
  else if (level === "minor") { min++; pat = 0; }
  else if (level === "patch") { pat++; }
  else fail(`--bump must be patch|minor|major`);
  return `${maj}.${min}.${pat}`;
}

function csv(s) {
  if (!s || s === true) return [];
  return String(s).split(",").map((x) => x.trim()).filter(Boolean);
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) { out[key] = next; i++; }
    else out[key] = true;
  }
  return out;
}

function fail(msg) {
  console.error(`✖ ${msg}`);
  process.exit(1);
}
