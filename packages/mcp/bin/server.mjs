#!/usr/bin/env node
// rahman-resources-mcp — Model Context Protocol server for the Rahman kitab.
// Stdio transport — wire into Claude Code / Cursor / Cline via:
//
//   {
//     "mcpServers": {
//       "rahman-resources": {
//         "command": "npx",
//         "args": ["-y", "rahman-resources-mcp"]
//       }
//     }
//   }
//
// Tools (read-only):
//   rr_list_templates              — full-app website-templates
//   rr_list_features               — backend/integration features
//   rr_list_recipes                — UI patterns
//   rr_list_skills                 — Claude skills inventory
//   rr_search                      — fuzzy across all kinds
//   rr_get                         — full entry by slug (any kind)
//   rr_compose_init_command        — emit the npx init command for a selection
//   rr_compose_add_commands        — emit add-commands for an existing project
//   rr_get_workflow                — full CRUD workflow doc for one kind
//   rr_list_workflows              — list all workflow kinds (templates/features/recipes/skills)
//
// Resources:
//   rr://manifest                  — full kitab manifest
//   rr://templates/{slug}          — one template
//   rr://features/{slug}           — one feature
//   rr://recipes/{slug}            — one recipe
//   rr://skills/{slug}             — one skill
//   rr://workflow/{kind}           — CRUD workflow markdown (kind = templates|features|recipes|skills)

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { findEntry, getManifest, getSkills, searchAll, getWorkflow, WORKFLOW_KINDS } from "../src/data-loader.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const PKG = require("../package.json");

const server = new Server(
  { name: "rahman-resources", version: PKG.version },
  { capabilities: { tools: {}, resources: {} } },
);

// ─── Tool definitions ─────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "rr_list_templates",
    description: "List Rahman website-template layouts (full-app templates) — slug, title, category, tags.",
    inputSchema: {
      type: "object",
      properties: {
        tag: { type: "string", description: "Optional tag filter (e.g. 'admin', 'blog')." },
      },
    },
  },
  {
    name: "rr_list_features",
    description: "List Rahman features (backend/integration capabilities templates compose).",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Optional category filter (ai|auth|data|payment|email|realtime|storage|search|content)." },
        usedBy: { type: "string", description: "Optional template slug — list features that template already uses." },
      },
    },
  },
  {
    name: "rr_list_recipes",
    description: "List Rahman recipes (UI/UX patterns to copy manually).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "rr_list_skills",
    description: "List available Claude Skills (anthropics/skills repo + Rahman extras). Used by add-skill / builder UI.",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Optional category (creative|design|development|documents|enterprise)." },
      },
    },
  },
  {
    name: "rr_search",
    description: "Fuzzy search across templates, features, recipes, and Claude skills. Returns ranked hits with kind + slug.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: { query: { type: "string", description: "Free-text query." } },
    },
  },
  {
    name: "rr_get",
    description: "Get full metadata for one entry by slug (template, feature, recipe, or skill).",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: { slug: { type: "string" } },
    },
  },
  {
    name: "rr_compose_init_command",
    description:
      "Build the npx rahman-resources init command for a chosen template + features + skills. Returns the shell command as a string.",
    inputSchema: {
      type: "object",
      required: ["appName"],
      properties: {
        appName: { type: "string" },
        template: { type: "string" },
        features: { type: "array", items: { type: "string" } },
        skills: { type: "array", items: { type: "string" } },
      },
    },
  },
  {
    name: "rr_compose_add_commands",
    description:
      "Build add / add-skill commands for an existing rr.json project. Returns a multi-line shell script.",
    inputSchema: {
      type: "object",
      properties: {
        features: { type: "array", items: { type: "string" } },
        skills: { type: "array", items: { type: "string" } },
        template: { type: "string", description: "Optional — only set if the project hasn't picked a template yet." },
      },
    },
  },
  {
    name: "rr_list_slices",
    description:
      "List all tier-3 portable feature slices the kitab ships. Slices are full-stack code units (frontend slice + convex feature half) that drop into any compatible project. Returns slug, title, category, version, peer slices, providers.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["ai", "auth", "data", "payment", "email", "realtime", "storage", "search", "content", "ui", "infra"],
          description: "Optional category filter.",
        },
      },
    },
  },
  {
    name: "rr_get_slice",
    description:
      "Get the full slice manifest entry by slug — includes slicePath, convexPaths, npm/shadcn/env/peer deps, providers. Use this when an agent is about to lift a slice into a project.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: {
        slug: { type: "string", description: "Slice slug, e.g., \"midtrans-payment\"." },
      },
    },
  },
  {
    name: "rr_compose_app",
    description:
      "Given an app intent + a list of desired slice slugs, returns the full sequence of npx commands to compose them onto a fresh project (init starter → add slices in dependency order). Validates peers transitively.",
    inputSchema: {
      type: "object",
      required: ["app", "slices"],
      properties: {
        app: { type: "string", description: "Target app name for `npx rahman-resources init <app>`." },
        template: { type: "string", description: "Optional website-template to scaffold first." },
        slices: { type: "array", items: { type: "string" }, description: "Slice slugs to lift after init." },
      },
    },
  },
  {
    name: "rr_audit_slice",
    description:
      "Validate one or more slice slugs against the kitab's peer/conflict matrix + convex table-name collision detection. Use BEFORE composing to catch broken combinations early. Returns { errors, warnings } — empty errors = clean.",
    inputSchema: {
      type: "object",
      required: ["slices"],
      properties: {
        slices: { type: "array", items: { type: "string" }, description: "Slice slugs to validate together." },
      },
    },
  },
  {
    name: "rr_list_workflows",
    description:
      "List the CRUD workflow kinds the kitab documents (templates, features, recipes, skills). Returns slugs the agent can pass to rr_get_workflow.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "rr_get_workflow",
    description:
      "Get the full CRUD workflow doc for one kitab item kind. Returns markdown with Create / Read / Update / Delete sections — including the npm publish step. Use this when the user asks how to add/edit/remove a template/feature/recipe/skill.",
    inputSchema: {
      type: "object",
      required: ["kind"],
      properties: {
        kind: {
          type: "string",
          enum: ["templates", "features", "recipes", "skills"],
          description: "Which kind of kitab item the workflow covers.",
        },
      },
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

// ─── Tool dispatch ────────────────────────────────────────────────────────

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  switch (name) {
    case "rr_list_templates": return ok(listTemplates(args));
    case "rr_list_features":  return ok(listFeatures(args));
    case "rr_list_recipes":   return ok(listRecipes());
    case "rr_list_skills":    return ok(listSkills(args));
    case "rr_search":         return ok(searchAll(args.query));
    case "rr_get":            return ok(getOne(args.slug));
    case "rr_compose_init_command": return text(composeInit(args));
    case "rr_compose_add_commands": return text(composeAdd(args));
    case "rr_list_slices":          return ok(listSlices(args));
    case "rr_get_slice":            return ok(getSlice(args.slug));
    case "rr_compose_app":          return text(composeApp(args));
    case "rr_audit_slice":          return ok(auditSlices(args));
    case "rr_list_workflows":       return ok(WORKFLOW_KINDS.map((k) => ({ kind: k, uri: `rr://workflow/${k}` })));
    case "rr_get_workflow":         return text(getWorkflow(args.kind));
    default:
      return errorResp(`Unknown tool: ${name}`);
  }
});

function listTemplates({ tag } = {}) {
  const m = getManifest();
  return (m.layouts ?? [])
    .filter((l) => l.category === "website-template")
    .filter((l) => !tag || (l.tags ?? []).includes(tag))
    .map(({ slug, title, category, description, tags, previewPath, adminPreviewPath }) => ({
      slug, title, category, description, tags, previewPath, adminPreviewPath,
    }));
}

function listFeatures({ category, usedBy } = {}) {
  const m = getManifest();
  return (m.features ?? [])
    .filter((f) => !category || f.category === category)
    .filter((f) => !usedBy || (f.usedBy ?? []).includes(usedBy))
    .map(({ slug, title, category: c, description, tags, npmPackages }) => ({
      slug, title, category: c, description, tags, npmPackages,
    }));
}

function listRecipes() {
  const m = getManifest();
  return (m.recipes ?? []).map(({ slug, title, description, source, tags }) => ({ slug, title, description, source, tags }));
}

function listSlices({ category } = {}) {
  const m = getManifest();
  return (m.slices ?? [])
    .filter((s) => !category || s.category === category)
    .map(({ slug, title, category: c, version, description, peers, providers, tags }) => ({
      slug, title, category: c, version, description, peers, providers, tags,
    }));
}

function getSlice(slug) {
  const m = getManifest();
  return (m.slices ?? []).find((s) => s.slug === slug) ?? null;
}

function composeApp({ app, template, slices = [] }) {
  const m = getManifest();
  const sliceMap = new Map((m.slices ?? []).map((s) => [s.slug, s]));
  const requested = slices.filter((s) => sliceMap.has(s));
  const missing = slices.filter((s) => !sliceMap.has(s));

  // Topo-sort by peers (slice with peer X must come after X).
  const ordered = [];
  const seen = new Set();
  function visit(slug) {
    if (seen.has(slug)) return;
    seen.add(slug);
    const s = sliceMap.get(slug);
    if (!s) return;
    for (const p of s.peers ?? []) {
      if (sliceMap.has(p.slug)) visit(p.slug);
    }
    ordered.push(slug);
  }
  for (const s of requested) visit(s);

  const lines = [];
  const initCmd = template
    ? `npx rahman-resources init ${app} --template ${template}`
    : `npx rahman-resources init ${app}`;
  lines.push(initCmd);
  lines.push(`cd ${app}`);
  for (const slug of ordered) {
    lines.push(`npx rahman-resources add ${slug}`);
  }
  let out = lines.map((l) => `  ${l}`).join("\n");
  if (missing.length > 0) {
    out += `\n\n⚠ Unknown slice slugs ignored: ${missing.join(", ")}`;
  }
  // Implicit peers added (those user didn't request but are needed)
  const implicit = ordered.filter((s) => !requested.includes(s));
  if (implicit.length > 0) {
    out += `\n\nℹ Auto-added peers: ${implicit.join(", ")}`;
  }
  return out;
}

// SLICE_COMPAT mirror — keep in sync with site/lib/build/compat.ts.
const SLICE_COMPAT = {
  "midtrans-payment": { conflicts: ["stripe-payment", "doku-payment"] },
};

function auditSlices({ slices = [] }) {
  const m = getManifest();
  const sliceMap = new Map((m.slices ?? []).map((s) => [s.slug, s]));
  const errors = [];
  const warnings = [];
  const present = new Set(slices);

  for (const slug of slices) {
    const s = sliceMap.get(slug);
    if (!s) {
      warnings.push(`unknown slice: ${slug} (not in kitab manifest)`);
      continue;
    }
    for (const p of s.peers ?? []) {
      if (!present.has(p.slug) && sliceMap.has(p.slug)) {
        errors.push(`${slug} requires peer ${p.slug} ${p.range} — missing from selection`);
      }
    }
  }
  for (const slug of slices) {
    const compat = SLICE_COMPAT[slug];
    if (!compat?.conflicts) continue;
    for (const c of compat.conflicts) {
      if (present.has(c)) errors.push(`${slug} conflicts with ${c}`);
    }
  }
  return { errors, warnings, ok: errors.length === 0 };
}

function listSkills({ category } = {}) {
  const skills = (getSkills().skills ?? []);
  return skills
    .filter((s) => !category || s.category === category)
    .map(({ slug, title, category: c, description, source, path }) => ({ slug, title, category: c, description, source, path }));
}

function getOne(slug) {
  const found = findEntry(slug);
  if (!found) return { error: `Not found: ${slug}` };
  return found;
}

function composeInit({ appName, template, features = [], skills = [] }) {
  const safe = String(appName ?? "my-app").replace(/[^a-z0-9-_]/gi, "-").toLowerCase() || "my-app";
  const parts = [`npx rahman-resources@latest init ${safe}`];
  if (template) parts.push(`--template ${template}`);
  if (features.length) parts.push(`--features ${features.join(",")}`);
  if (skills.length) parts.push(`--skills ${skills.join(",")}`);
  return parts.join(" \\\n  ");
}

function composeAdd({ template, features = [], skills = [] }) {
  const lines = ["# Run from the root of an existing rr.json project."];
  if (template) lines.push(`npx rahman-resources@latest add ${template}`);
  for (const f of features) lines.push(`npx rahman-resources@latest add ${f}`);
  for (const s of skills) lines.push(`npx rahman-resources@latest add-skill ${s}`);
  if (lines.length === 1) lines.push("# (no items selected)");
  return lines.join("\n");
}

// ─── Resources ────────────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const m = getManifest();
  const skills = getSkills().skills ?? [];
  const resources = [
    { uri: "rr://manifest", name: "Rahman Resources manifest", description: "Full kitab manifest (templates + features + recipes).", mimeType: "application/json" },
  ];
  for (const t of m.layouts ?? []) {
    resources.push({ uri: `rr://templates/${t.slug}`, name: t.title, description: t.description, mimeType: "application/json" });
  }
  for (const f of m.features ?? []) {
    resources.push({ uri: `rr://features/${f.slug}`, name: f.title, description: f.description, mimeType: "application/json" });
  }
  for (const r of m.recipes ?? []) {
    resources.push({ uri: `rr://recipes/${r.slug}`, name: r.title, description: r.description, mimeType: "application/json" });
  }
  for (const s of skills) {
    resources.push({ uri: `rr://skills/${s.slug}`, name: s.title, description: s.description, mimeType: "application/json" });
  }
  for (const sl of m.slices ?? []) {
    resources.push({ uri: `rr://slices/${sl.slug}`, name: sl.title, description: sl.description, mimeType: "application/json" });
  }
  for (const k of WORKFLOW_KINDS) {
    resources.push({
      uri: `rr://workflow/${k}`,
      name: `Workflow — ${k}`,
      description: `CRUD workflow for kitab ${k} (Create / Read / Update / Delete + publish step).`,
      mimeType: "text/markdown",
    });
  }
  return { resources };
});

server.setRequestHandler(ReadResourceRequestSchema, async (req) => {
  const uri = req.params.uri;
  if (uri === "rr://manifest") {
    return resourceJson(uri, getManifest());
  }
  const wf = uri.match(/^rr:\/\/workflow\/(templates|features|recipes|skills)$/);
  if (wf) {
    try {
      return resourceMarkdown(uri, getWorkflow(wf[1]));
    } catch (e) {
      return resourceError(uri, e.message);
    }
  }
  const m = uri.match(/^rr:\/\/(templates|features|recipes|skills|slices)\/(.+)$/);
  if (!m) return resourceError(uri, `Unknown resource URI: ${uri}`);
  const [, kind, slug] = m;
  if (kind === "skills") {
    const sk = (getSkills().skills ?? []).find((s) => s.slug === slug);
    if (!sk) return resourceError(uri, `Skill not found: ${slug}`);
    return resourceJson(uri, sk);
  }
  // `templates` URI maps to `layouts` in the manifest
  const manifestKey = kind === "templates" ? "layouts" : kind;
  const list = getManifest()[manifestKey] ?? [];
  const e = list.find((x) => x.slug === slug);
  if (!e) return resourceError(uri, `${kind} not found: ${slug}`);
  return resourceJson(uri, e);
});

// ─── helpers ──────────────────────────────────────────────────────────────

function ok(value) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}
function text(value) {
  return { content: [{ type: "text", text: value }] };
}
function errorResp(message) {
  return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
}
function resourceJson(uri, value) {
  return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(value, null, 2) }] };
}
function resourceMarkdown(uri, markdown) {
  return { contents: [{ uri, mimeType: "text/markdown", text: markdown }] };
}
function resourceError(uri, message) {
  return { contents: [{ uri, mimeType: "text/plain", text: `Error: ${message}` }] };
}

// ─── boot ─────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
