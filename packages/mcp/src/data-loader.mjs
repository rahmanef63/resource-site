// Loads Rahman Resources data — manifest (templates/features/recipes) + skills + workflows.
// Reuses the CLI's lib/manifest.json + lib/skills.json + lib/workflows/*.md so there's a
// single source of truth shared between the CLI, the builder UI, and this MCP server.

import { createRequire } from "node:module";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Prefer the published `rahman-resources` package (the runtime dep). Falls back
// to the sibling-monorepo path for local dev when deps haven't been linked.
function resolveCliFile(file) {
  try {
    return require.resolve(`rahman-resources/lib/${file}`);
  } catch {
    const local = path.resolve(__dirname, `../../cli/lib/${file}`);
    if (existsSync(local)) return local;
    throw new Error(
      `rahman-resources-mcp: cannot locate lib/${file} — install rahman-resources as a dep or run from the resources monorepo.`,
    );
  }
}

const manifestPath = resolveCliFile("manifest.json");
const skillsPath = resolveCliFile("skills.json");

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

export function findEntry(slug) {
  const m = getManifest();
  for (const kind of ["layouts", "recipes", "features"]) {
    const e = (m[kind] ?? []).find((x) => x.slug === slug);
    if (e) return { kind: kind.slice(0, -1), entry: e };
  }
  const skill = (getSkills().skills ?? []).find((s) => s.slug === slug);
  if (skill) return { kind: "skill", entry: skill };
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
  return hits.sort((a, b) => b.score - a.score).slice(0, 25);
}
