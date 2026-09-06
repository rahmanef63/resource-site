// Loads Rahman Resources data — manifest (templates/features/recipes) + skills + workflows.
// Reuses the CLI's lib/manifest.json + lib/skills.json + lib/workflows/*.md so there's a
// single source of truth shared between the CLI, the builder UI, and this MCP server.

import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Prefer the sibling CLI SSOT in the monorepo. Published/container builds use
// the generated runtime snapshot shipped inside this package. sync-runtime.mjs
// hashes every bundled file against packages/cli/lib so the copy cannot drift.
function resolveCliFile(file) {
  const sibling = path.resolve(__dirname, `../../cli/lib/${file}`);
  if (existsSync(sibling)) return sibling;
  const bundled = path.resolve(__dirname, `../runtime/rahman-resources/lib/${file}`);
  if (existsSync(bundled)) return bundled;
  throw new Error(
    `rahman-resources-mcp: cannot locate bundled lib/${file} — run packages/mcp/scripts/sync-runtime.mjs.`,
  );
}

const manifestPath = resolveCliFile("manifest.json");
const skillsPath = resolveCliFile("skills.json");
const infrastructurePath = resolveCliFile("infrastructure-resources.json");

// Workflow markdown files live at lib/workflows/<kind>.md inside the CLI bundle.
// Resolved lazily — same fallback strategy as manifest/skills.
function resolveWorkflowFile(kind) {
  return resolveCliFile(`workflows/${kind}.md`);
}

export const WORKFLOW_KINDS = ["templates", "features", "recipes", "skills"];

const _workflowCache = {};

export function getWorkflow(kind) {
  if (!WORKFLOW_KINDS.includes(kind)) {
    throw new Error(`rahman-resources-mcp: unknown workflow kind "${kind}". Use one of: ${WORKFLOW_KINDS.join(", ")}.`);
  }
  if (_workflowCache[kind]) return _workflowCache[kind];
  const filePath = resolveWorkflowFile(kind);
  const md = readFileSync(filePath, "utf-8");
  _workflowCache[kind] = md;
  return md;
}

let _manifest = null;
let _skills = null;
let _infrastructure = null;

export function getManifest() {
  if (_manifest) return _manifest;
  _manifest = require(manifestPath);
  return _manifest;
}

export function getSkills() {
  if (_skills) return _skills;
  _skills = require(skillsPath);
  return _skills;
}

export function getInfrastructureResources() {
  if (_infrastructure) return _infrastructure;
  _infrastructure = require(infrastructurePath);
  return _infrastructure;
}

export function findEntry(slug) {
  const m = getManifest();
  for (const kind of ["layouts", "recipes", "features"]) {
    const e = (m[kind] ?? []).find((x) => x.slug === slug);
    if (e) return { kind: kind.slice(0, -1), entry: e };
  }
  const skill = (getSkills().skills ?? []).find((s) => s.slug === slug);
  if (skill) return { kind: "skill", entry: skill };
  const infrastructure = (getInfrastructureResources().resources ?? []).find((r) => r.id === slug);
  if (infrastructure) return { kind: "infrastructure", entry: infrastructure };
  return null;
}

export function searchAll(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  const m = getManifest();
  const hits = [];
  const score = (text) => (text?.toLowerCase().includes(q) ? 1 : 0);
  for (const kind of ["layouts", "recipes", "features"]) {
    for (const e of m[kind] ?? []) {
      const s = score(e.slug) * 4 + score(e.title) * 3 + score(e.description) * 2 + score((e.tags ?? []).join(" "));
      if (s > 0) hits.push({ kind: kind.slice(0, -1), slug: e.slug, title: e.title, description: e.description, score: s });
    }
  }
  for (const sk of getSkills().skills ?? []) {
    const s = score(sk.slug) * 4 + score(sk.title) * 3 + score(sk.description) * 2 + score(sk.category);
    if (s > 0) hits.push({ kind: "skill", slug: sk.slug, title: sk.title, description: sk.description, score: s });
  }
  for (const r of getInfrastructureResources().resources ?? []) {
    const s = score(r.id) * 4 + score(r.label) * 3 + score(r.purpose) * 2 + score(`${r.provider} ${r.fieldKey}`);
    if (s > 0) hits.push({ kind: "infrastructure", slug: r.id, title: r.label, description: r.purpose, score: s });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 25);
}
