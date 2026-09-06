// MCP tool definitions for rahman-resources-mcp.
// Pure data — extracted from bin/server.mjs.

export const TOOLS = [
  {
    name: "rr_list_templates",
    description:
      "List Rahman website-template layouts (full-app templates) — slug, title, category, tags. Use when picking a starting template for a NEW app; for installable feature slices use rr_list_slices instead.",
    inputSchema: {
      type: "object",
      properties: {
        tag: { type: "string", description: "Optional tag filter (e.g. 'admin', 'blog')." },
      },
    },
  },
  {
    name: "rr_list_features",
    description:
      "List Rahman features (backend/integration capabilities templates compose). Use when extending a template with a named capability (auth, payment, email, …); slices are the more granular unit — prefer rr_list_slices when unsure.",
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
    name: "rr_list_infrastructure",
    description:
      "List public infrastructure/provider field guidance from Rahman Resources. Returns where a value comes from, whether it is public/sensitive/secret, inheritance guidance, automation level, and official links. Credential values are never stored here.",
    inputSchema: {
      type: "object",
      properties: { provider: { type: "string", description: "Optional provider filter, e.g. convex, google_cloud, doku." } },
    },
  },
  {
    name: "rr_get_infrastructure",
    description:
      "Get one exact infrastructure resource definition by id, e.g. convex.custom_site_domain or doku.payment_secret_key. Use before asking a user for any provider field.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    },
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
    description:
      "Fuzzy search across templates, features, recipes, and Claude skills. Returns ranked hits with kind + slug. Use FIRST when you only have a vague name or a not_found error from another tool.",
    inputSchema: {
      type: "object",
      required: ["query"],
      properties: { query: { type: "string", description: "Free-text query." } },
    },
  },
  {
    name: "rr_get",
    description:
      "Get full metadata for one entry by slug — templates, features, recipes, or skills ONLY. For a slice use rr_get_slice (richer install metadata). Use when you already know the exact slug.",
    inputSchema: {
      type: "object",
      required: ["slug"],
      properties: { slug: { type: "string" } },
    },
  },
  {
    name: "rr_compose_init_command",
    description:
      "Build ONE `npx rahman-resources init` shell command for a chosen template + features + skills. Use when starting a NEW project and you just need the init one-liner. For an existing rr.json project use rr_compose_add_commands; for slice-based composition with peer ordering use rr_compose_app.",
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
      "Build add / add-skill commands for an EXISTING rr.json project (already initialized). Returns a multi-line shell script. Use when the user wants to add more items to an app they already scaffolded — NOT for a fresh app (use rr_compose_init_command or rr_compose_app).",
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
      "List all tier-3 portable feature slices rr ships. Slices are full-stack code units (frontend slice + convex feature half) that drop into any compatible project — the primary install unit. Returns slug, title, category, version, peer slices, providers. Use as the default discovery tool.",
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
      "Given an app name + desired SLICE slugs, returns the full npx command sequence for a FRESH project (init starter → cd → add slices in dependency order), auto-adding missing peers transitively. Use when scaffolding a new app around slices; run rr_audit_slice first to catch conflicts.",
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
      "Validate one or more slice slugs against rr's peer/conflict matrix + convex table-name collision detection. Use BEFORE rr_compose_app to catch broken combinations early. Returns { errors, warnings, ok } — empty errors = clean.",
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
      "List the CRUD workflow kinds rr documents (templates, features, recipes, skills). Returns kinds to pass to rr_get_workflow. Use when the user asks how to maintain/extend the rr library itself (not when installing into an app).",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "rr_get_workflow",
    description:
      "Get the full CRUD workflow doc for one rr item kind. Returns markdown with Create / Read / Update / Delete sections — including the npm publish step. Use when the user asks how to add/edit/remove a template/feature/recipe/skill in the rr library.",
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
