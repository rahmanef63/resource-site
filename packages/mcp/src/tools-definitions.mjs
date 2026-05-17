// MCP tool definitions for rahman-resources-mcp.
// Pure data — extracted from bin/server.mjs.

export const TOOLS = [
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
