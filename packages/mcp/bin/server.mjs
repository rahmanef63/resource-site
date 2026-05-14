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
//   rr://graph/lineage             — full slice-DNA lineage graph
//   rr://graph/lineage/{slug}      — one slice's DNA (lineage + adoption)
//   rr://graph/consumers/{name}    — every slice a consumer adopted

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { createServer } from "node:http";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { findEntry, getManifest, getSkills, searchAll, getWorkflow, WORKFLOW_KINDS } from "../src/data-loader.mjs";
import { listLineageResources, readLineageResource, LINEAGE_URI_PREFIX } from "../src/resources/lineage.mjs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const PKG = require("../package.json");

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

// Handler bodies as plain async fns so they can be wired onto any Server
// instance (stdio uses one long-lived Server; stateless HTTP mints a fresh
// Server + Transport per request, which is required by the SDK to avoid
// "Stateless transport cannot be reused across requests" errors).

const handleListTools = async () => ({ tools: TOOLS });

const handleCallTool = async (req) => {
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
};

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

// Strip everything outside [a-z0-9-_] to render shell-safe args inside
// the npx command strings. Lossy by design — we'd rather mangle the slug
// than emit a `; rm -rf /` payload into the user's terminal.
function sanitizeShellArg(s) {
  return String(s).replace(/[^a-z0-9-_]/gi, "-");
}

function composeApp({ app, template, slices = [] }) {
  // Sanitize app + template for shell-safety in the rendered command (user
  // copy-pastes this into a real shell). composeInit applies the same
  // pattern via .replace(/[^a-z0-9-_]/gi, "-").
  const safeApp = sanitizeShellArg(String(app ?? "my-app"));
  const safeTemplate = template ? sanitizeShellArg(String(template)) : null;
  if (!Array.isArray(slices)) {
    return `⚠ slices must be an array (got ${typeof slices})`;
  }
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
  const initCmd = safeTemplate
    ? `npx rahman-resources init ${safeApp} --template ${safeTemplate}`
    : `npx rahman-resources init ${safeApp}`;
  lines.push(initCmd);
  lines.push(`cd ${safeApp}`);
  for (const slug of ordered) {
    lines.push(`npx rahman-resources add ${sanitizeShellArg(slug)}`);
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
  if (!Array.isArray(slices)) {
    return { errors: [`slices must be an array (got ${typeof slices})`], warnings: [], ok: false };
  }
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

const handleListResources = async () => {
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
  // Slice-DNA lineage resources (rr://graph/*) — see src/resources/lineage.mjs.
  try {
    const lineage = await listLineageResources();
    for (const r of lineage) resources.push(r);
  } catch (err) {
    console.error("[mcp] failed to enumerate lineage resources:", err?.message ?? err);
  }
  return { resources };
};

const handleReadResource = async (req) => {
  const uri = req.params.uri;
  if (uri === "rr://manifest") {
    return resourceJson(uri, getManifest());
  }
  // Slice-DNA lineage URIs (rr://graph/...) — delegated to lineage.mjs.
  if (typeof uri === "string" && uri.startsWith(LINEAGE_URI_PREFIX)) {
    const result = await readLineageResource(uri);
    if (result.match) {
      if (result.error) return resourceError(uri, result.error);
      return resourceJson(uri, result.payload);
    }
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
};

// Build a fresh MCP Server with all handlers wired. Used per-request in
// stateless HTTP mode and once at boot in stdio mode.
function makeServer() {
  const s = new Server(
    { name: "rahman-resources", version: PKG.version },
    { capabilities: { tools: {}, resources: {} } },
  );
  s.setRequestHandler(ListToolsRequestSchema, handleListTools);
  s.setRequestHandler(CallToolRequestSchema, handleCallTool);
  s.setRequestHandler(ListResourcesRequestSchema, handleListResources);
  s.setRequestHandler(ReadResourceRequestSchema, handleReadResource);
  return s;
}

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

function getArg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

// Cap body size to prevent memory DoS via large POST. 1 MiB is far more than
// any legit JSON-RPC request needs (tools/list responses are ~5 KiB).
const MAX_BODY_BYTES = 1 * 1024 * 1024;

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    let bytes = 0;
    let killed = false;
    req.on("data", (chunk) => {
      if (killed) return;
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        killed = true;
        const err = new Error("body too large");
        err.statusCode = 413;
        req.destroy();
        reject(err);
        return;
      }
      raw += chunk;
    });
    req.on("end", () => {
      if (killed) return;
      if (!raw) { resolve(undefined); return; }
      try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
    });
    req.on("error", reject);
  });
}

// Constant-time bearer compare to defeat timing attacks. Length check first
// avoids leaking length via early-return timing.
function bearerMatches(provided, expected) {
  if (typeof provided !== "string" || !provided.startsWith("Bearer ")) return false;
  const token = provided.slice(7);
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

const IS_PROD = process.env.NODE_ENV === "production";

// ─── OAuth 2.1 + PKCE ─────────────────────────────────────────────────────
//
// Minimum-viable OAuth for ChatGPT custom-app connector. ChatGPT's form
// only offers OAuth dropdown — bearer/none isn't selectable. Per MCP spec
// 2025-11-25 §"Authorization" + RFC 7636 (PKCE) + RFC 8414 (AS metadata)
// + RFC 9728 (Protected Resource metadata).
//
// Stripped-down design choices:
//   - data is PUBLIC read-only (kitab manifest), so consent page is NOT
//     gated by admin login. Anyone who visits /oauth/authorize can mint
//     a token by clicking Authorize. The OAuth flow is ceremonial — its
//     job is to satisfy ChatGPT's connector form.
//   - access tokens are stateless HMAC-signed strings (no DB). Format:
//     `<random>.<exp_seconds>.<hmac(random.exp, SIGNING_KEY)>`.
//   - auth codes live in an in-memory Map with TTL (5 min). Container
//     restart drops mid-flow codes — user re-clicks Authorize. Tradeoff
//     accepted (PKCE state is small + short-lived).
//   - revocation = rotate SIGNING_KEY (invalidates all tokens at once).
//     Per-token revocation needs DB; out of scope for read-only public.

function b64url(buf) {
  return Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function sha256B64Url(s) {
  return b64url(createHash("sha256").update(s).digest());
}

// HMAC-bound opaque access token. JWT-shaped without the JOSE header
// overhead — we control both sides, no interop concern.
function mintAccessToken(signingKey, ttlSeconds = 365 * 24 * 60 * 60) {
  const random = b64url(randomBytes(32));
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${random}.${exp}`;
  const sig = b64url(createHmac("sha256", signingKey).update(payload).digest());
  return `${payload}.${sig}`;
}
function verifyAccessToken(token, signingKey) {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [random, expStr, sig] = parts;
  if (!random || !expStr || !sig) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) return null;
  const payload = `${random}.${expStr}`;
  const expected = b64url(createHmac("sha256", signingKey).update(payload).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return { exp, jti: random };
}

// Auth code store. Map<code, { challenge, method, redirectUri, clientId, scope, resource, exp }>.
const authCodes = new Map();
const AUTH_CODE_TTL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [code, rec] of authCodes) if (rec.exp <= now) authCodes.delete(code);
}, 60_000).unref?.();

function verifyPkce({ verifier, challenge, method }) {
  if (method !== "S256") return false; // refuse 'plain' per spec
  if (typeof verifier !== "string" || verifier.length < 43 || verifier.length > 128) return false;
  return sha256B64Url(verifier) === challenge;
}

const useHttp = process.argv.includes("--http") || process.env.MCP_HTTP === "1";

if (useHttp) {
  const port = parseInt(getArg("--port") ?? process.env.PORT ?? "8000", 10);
  const host = getArg("--host") ?? process.env.HOST ?? "0.0.0.0";
  // Optional bearer auth. When unset, server is open (read-only public manifest).
  // MCP spec 2025-11-25: "Authorization is OPTIONAL".
  const bearer = process.env.MCP_BEARER_TOKEN || null;
  // OAuth signing key — enables /oauth/* + /.well-known/* routes when set.
  // Generate with: openssl rand -hex 32. Persist via Dokploy env so tokens
  // survive redeploys. Rotating this key revokes all issued tokens.
  const oauthKey = process.env.MCP_OAUTH_SIGNING_KEY || null;
  // Public origin for discovery metadata (https://mcp-resource.rahmanef.com).
  // Auto-derived from request Host if unset, but RFC 8414 metadata is cached
  // so set explicitly in prod.
  const publicBase = process.env.MCP_BASE_URL || null;

  // NOTE: In stateless mode, the SDK requires a FRESH transport per request
  // (otherwise it throws "Stateless transport cannot be reused across requests").
  // We also build a fresh Server per request because Server↔Transport are paired.
  // Tool/resource handlers come from the shared TOOLS array + dispatch fns, so
  // per-request construction is cheap (no manifest reload, no IO).

  const httpServer = createServer(async (req, res) => {
    // CORS — allow any origin (read-only public manifest, no cookies).
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Mcp-Session-Id, Last-Event-ID");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    // Resolve the effective public origin once per request (for discovery metadata + redirects).
    const reqOrigin = publicBase || (req.headers.host ? `https://${req.headers.host}` : "");

    // Health probe for Dokploy / docker liveness.
    if (req.url === "/health" || req.url === "/") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({
        ok: true,
        name: "rahman-resources-mcp",
        version: PKG.version,
        endpoint: "/mcp",
        // /mcp is open unless operator sets MCP_BEARER_TOKEN.
        mcp_open: !bearer,
        // OAuth endpoints serve (for ChatGPT form compat) but tokens are not enforced.
        oauth_endpoints: !!oauthKey,
      }));
      return;
    }

    // ── OAuth 2.1 + PKCE routes (enabled when MCP_OAUTH_SIGNING_KEY set) ──
    if (oauthKey && req.url?.startsWith("/.well-known/oauth-authorization-server")) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.end(JSON.stringify({
        // RFC 8414 — OAuth 2.0 Authorization Server Metadata
        issuer: reqOrigin,
        authorization_endpoint: `${reqOrigin}/oauth/authorize`,
        token_endpoint: `${reqOrigin}/api/oauth/token`,
        response_types_supported: ["code"],
        grant_types_supported: ["authorization_code"],
        code_challenge_methods_supported: ["S256"],
        token_endpoint_auth_methods_supported: ["none"],
        scopes_supported: ["mcp"],
      }));
      return;
    }
    if (oauthKey && req.url?.startsWith("/.well-known/oauth-protected-resource")) {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.end(JSON.stringify({
        // RFC 9728 — OAuth 2.0 Protected Resource Metadata
        resource: `${reqOrigin}/mcp`,
        authorization_servers: [reqOrigin],
        scopes_supported: ["mcp"],
        bearer_methods_supported: ["header"],
      }));
      return;
    }

    if (oauthKey && req.url?.startsWith("/oauth/authorize") && (req.method === "GET" || req.method === "POST")) {
      const url = new URL(req.url, reqOrigin || "http://localhost");
      const params = url.searchParams;
      const clientId = params.get("client_id");
      const redirectUri = params.get("redirect_uri");
      const responseType = params.get("response_type");
      const codeChallenge = params.get("code_challenge");
      const codeChallengeMethod = params.get("code_challenge_method") || "S256";
      const state = params.get("state") || "";
      const scope = params.get("scope") || "mcp";
      const resource = params.get("resource") || `${reqOrigin}/mcp`;

      // Validate query
      const errs = [];
      if (responseType !== "code") errs.push("response_type must be 'code'");
      if (!clientId) errs.push("client_id required");
      if (!redirectUri) errs.push("redirect_uri required");
      try { const u = new URL(redirectUri); if (u.protocol !== "https:" && u.hostname !== "localhost" && u.hostname !== "127.0.0.1") errs.push("redirect_uri must be HTTPS (or localhost)"); } catch { errs.push("redirect_uri invalid URL"); }
      if (!codeChallenge) errs.push("code_challenge required");
      if (codeChallengeMethod !== "S256") errs.push("code_challenge_method must be S256");
      if (errs.length > 0) {
        res.statusCode = 400;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(`<!doctype html><meta charset=utf-8><title>OAuth error</title><pre>${errs.map((e) => e.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c]))).join("\n")}</pre>`);
        return;
      }

      if (req.method === "POST") {
        // Consent granted → mint single-use code.
        const code = b64url(randomBytes(24));
        authCodes.set(code, {
          challenge: codeChallenge,
          method: codeChallengeMethod,
          redirectUri,
          clientId,
          scope,
          resource,
          exp: Date.now() + AUTH_CODE_TTL_MS,
        });
        const sep = redirectUri.includes("?") ? "&" : "?";
        const loc = `${redirectUri}${sep}code=${encodeURIComponent(code)}${state ? `&state=${encodeURIComponent(state)}` : ""}`;
        res.statusCode = 302;
        res.setHeader("Location", loc);
        res.end();
        return;
      }

      // GET — render minimal consent page. Echo all PKCE params via hidden form
      // so POST re-receives them (the auth code MAC binds to the challenge).
      const esc = (s) => String(s ?? "").replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c]));
      const hidden = Object.fromEntries(params.entries());
      const inputs = Object.entries(hidden).map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`).join("");
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Authorize ${esc(clientId)} — rahman-resources-mcp</title>
<style>
  *{box-sizing:border-box}body{font:14px/1.5 system-ui,sans-serif;margin:0;background:#0a0a0a;color:#fafafa;display:grid;place-items:center;min-height:100vh;padding:24px}
  .card{max-width:480px;width:100%;background:#171717;border:1px solid #262626;border-radius:12px;padding:32px}
  h1{margin:0 0 8px;font-size:18px}h2{margin:0 0 4px;font-size:13px;color:#a3a3a3;font-weight:500;text-transform:uppercase;letter-spacing:0.04em}
  p{margin:8px 0;color:#d4d4d4}.client{font-family:ui-monospace,monospace;background:#262626;padding:2px 6px;border-radius:4px;font-size:12px}
  ul{margin:8px 0;padding-left:20px;color:#d4d4d4;font-size:13px}
  .actions{margin-top:24px;display:flex;gap:12px}
  button{flex:1;padding:10px 16px;border-radius:6px;border:1px solid #404040;background:#262626;color:#fafafa;font:inherit;cursor:pointer}
  button[type=submit]{background:#10b981;border-color:#10b981;color:#0a0a0a;font-weight:600}
  button:hover{filter:brightness(1.1)}
  .meta{margin-top:16px;font-size:11px;color:#737373;font-family:ui-monospace,monospace;word-break:break-all}
</style></head><body>
<form method="POST" class="card">
  <h2>OAuth authorization</h2>
  <h1>Authorize <span class="client">${esc(clientId)}</span></h1>
  <p>This will let the app call <strong>rahman-resources-mcp</strong> on your behalf.</p>
  <ul>
    <li>Read-only access to the kitab manifest (templates, slices, recipes, skills)</li>
    <li>14 tools available — all return public data already shown on <a href="https://resource.rahmanef.com" style="color:#10b981">resource.rahmanef.com</a></li>
    <li>No personal data, no writes</li>
  </ul>
  ${inputs}
  <div class="actions">
    <button type="button" onclick="window.location='${esc(redirectUri)}${redirectUri.includes("?") ? "&" : "?"}error=access_denied${state ? `&state=${esc(state)}` : ""}'">Deny</button>
    <button type="submit">Authorize</button>
  </div>
  <div class="meta">redirect: ${esc(redirectUri)}<br>resource: ${esc(resource)}<br>scope: ${esc(scope)}</div>
</form></body></html>`);
      return;
    }

    if (oauthKey && req.url === "/api/oauth/token" && req.method === "POST") {
      const ctype = String(req.headers["content-type"] || "");
      let raw = "";
      let bytes = 0;
      let killed = false;
      const body = await new Promise((resolve, reject) => {
        req.on("data", (chunk) => {
          if (killed) return;
          bytes += chunk.length;
          if (bytes > 64 * 1024) { killed = true; req.destroy(); reject(Object.assign(new Error("body too large"), { statusCode: 413 })); return; }
          raw += chunk;
        });
        req.on("end", () => { if (!killed) resolve(raw); });
        req.on("error", reject);
      });
      let parsed = {};
      try {
        if (ctype.includes("application/json")) parsed = JSON.parse(raw || "{}");
        else for (const [k, v] of new URLSearchParams(raw)) parsed[k] = v;
      } catch {
        res.statusCode = 400;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "invalid_request", error_description: "malformed body" }));
        return;
      }
      const { grant_type, code, code_verifier, redirect_uri, client_id } = parsed;
      const failJson = (status, err, desc) => {
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify({ error: err, ...(desc ? { error_description: desc } : {}) }));
      };
      if (grant_type !== "authorization_code") return failJson(400, "unsupported_grant_type", "expected authorization_code");
      if (!code || !code_verifier || !redirect_uri || !client_id) return failJson(400, "invalid_request", "missing field");
      const rec = authCodes.get(code);
      if (!rec) return failJson(400, "invalid_grant", "code unknown");
      // Atomic single-use: delete BEFORE issuing token (defeats retry double-mint).
      authCodes.delete(code);
      if (rec.exp <= Date.now()) return failJson(400, "invalid_grant", "code expired");
      if (rec.clientId !== client_id) return failJson(400, "invalid_grant", "client_id mismatch");
      if (rec.redirectUri !== redirect_uri) return failJson(400, "invalid_grant", "redirect_uri mismatch");
      if (!verifyPkce({ verifier: code_verifier, challenge: rec.challenge, method: rec.method })) {
        return failJson(400, "invalid_grant", "PKCE verifier mismatch");
      }
      const access_token = mintAccessToken(oauthKey);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-store");
      res.end(JSON.stringify({
        access_token,
        token_type: "Bearer",
        expires_in: 365 * 24 * 60 * 60,
        scope: rec.scope,
      }));
      return;
    }

    // MCP endpoint.
    const isMcp = req.url === "/mcp" || (req.url && req.url.startsWith("/mcp?"));
    if (!isMcp) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "not_found", hint: "POST /mcp" }));
      return;
    }

    // Auth check. /mcp is OPEN BY DEFAULT — the kitab manifest is the same
    // public data shown on resource.rahmanef.com. The whole point of this
    // server is to help users discover + compose kitab artifacts; gating
    // it behind auth adds friction without protecting anything.
    //
    //   - MCP_BEARER_TOKEN set → operator escape hatch for private forks
    //     (e.g. internal mirror). Standard kitab deploy leaves it unset.
    //   - OAuth tokens (minted by /oauth/* when MCP_OAUTH_SIGNING_KEY is set)
    //     are NOT validated here. The OAuth flow exists purely so ChatGPT's
    //     custom-app form has somewhere to point — the issued token is
    //     paperwork. ChatGPT can still bind a Bearer header; we ignore it.
    if (bearer) {
      const auth = req.headers["authorization"];
      if (!bearerMatches(auth, bearer)) {
        res.statusCode = 401;
        res.setHeader(
          "WWW-Authenticate",
          `Bearer realm="rahman-resources-mcp"`,
        );
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "unauthorized" }));
        return;
      }
    }

    // Stateless: a fresh Server + Transport per request. The SDK throws
    // "Stateless transport cannot be reused across requests" otherwise.
    let perReqTransport;
    let perReqServer;
    try {
      const body = req.method === "POST" ? await readJsonBody(req) : undefined;
      perReqTransport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      perReqServer = makeServer();
      await perReqServer.connect(perReqTransport);
      // Clean up when the underlying HTTP response finishes streaming.
      res.on("close", () => {
        perReqTransport?.close?.();
        perReqServer?.close?.();
      });
      await perReqTransport.handleRequest(req, res, body);
    } catch (err) {
      console.error("[mcp/http] handleRequest error:", err);
      if (!res.headersSent) {
        const status = err?.statusCode ?? 500;
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json");
        // In prod, never leak err.message (may contain fs paths, env hints,
        // stack frames). Return opaque error code. Devs get full detail in
        // stderr/Dokploy logs.
        const payload = IS_PROD
          ? { error: status === 413 ? "payload_too_large" : "internal_error" }
          : { error: "internal_error", message: String(err?.message ?? err) };
        res.end(JSON.stringify(payload));
      }
      try { perReqTransport?.close?.(); } catch {}
      try { perReqServer?.close?.(); } catch {}
    }
  });

  // Anti-slowloris: drop sockets that don't make progress.
  //   requestTimeout — max wall time per request (including body upload)
  //   headersTimeout — max time to receive complete headers
  //   keepAliveTimeout — idle keep-alive socket close
  httpServer.requestTimeout = 30_000;
  httpServer.headersTimeout = 10_000;
  httpServer.keepAliveTimeout = 5_000;

  httpServer.listen(port, host, () => {
    console.error(`rahman-resources-mcp v${PKG.version} — HTTP transport`);
    console.error(`  listening:  http://${host}:${port}`);
    console.error(`  endpoint:   POST /mcp  (Streamable HTTP, stateless)`);
    console.error(`  health:     GET /health`);
    console.error(`  /mcp auth:  ${bearer ? "env-Bearer (MCP_BEARER_TOKEN, constant-time)" : "OPEN — public read-only kitab manifest"}`);
    if (oauthKey) {
      console.error(`  /oauth:     enabled (ceremonial — tokens issued, not enforced on /mcp)`);
      console.error(`  oauth as:   ${publicBase || "(derive from Host)"} — /oauth/authorize + /api/oauth/token`);
      console.error(`  discovery:  /.well-known/oauth-{authorization-server,protected-resource}`);
    } else {
      console.error(`  /oauth:     disabled — set MCP_OAUTH_SIGNING_KEY to expose ceremonial OAuth for ChatGPT form`);
    }
    console.error(`  limits:     body=${MAX_BODY_BYTES}B req=${httpServer.requestTimeout}ms hdr=${httpServer.headersTimeout}ms`);
  });
} else {
  // Default stdio transport for Claude Code / Cursor / Cline.
  const transport = new StdioServerTransport();
  const server = makeServer();
  await server.connect(transport);
}
