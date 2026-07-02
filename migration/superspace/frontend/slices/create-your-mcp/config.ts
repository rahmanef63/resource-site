import { defineFeature } from "@/frontend/shared/lib/features/defineFeature"

/**
 * `create-your-mcp` — turn this workspace into an MCP server that ChatGPT
 * custom apps, Claude.ai connectors, Cursor MCP, and other AI clients can
 * authenticate to via OAuth 2.1 + PKCE (vendored via `rr add create-your-mcp`).
 *
 * ADAPTED (non-functional scaffold): the OAuth/PKCE route templates + admin
 * view compile against superspace, but the Convex HTTP client used by the two
 * route templates (`lib/convex-http.ts`) is a stub that throws — no live
 * provider/secret calls. The `/dashboard/create-your-mcp` admin page renders
 * the token table + connector-setup panel with empty/stubbed data.
 *
 * To make it live (supervised sp-backend follow-up): wire `lib/convex-http.ts`
 * to a real `ConvexHttpClient` (see `app/api/ai/execute-tool/route.ts`), move
 * the `routes/*.route.ts` templates into `app/api/`, and set `MCP_API_KEY` /
 * `MCP_OAUTH_ALLOWED_HOSTS` on both Next + Convex.
 */
const createYourMcpConfig = defineFeature({
  id: "create-your-mcp",
  name: "Create Your MCP",
  description:
    "Ubah workspace jadi server MCP — sambungkan ChatGPT, Claude.ai, atau Cursor lewat OAuth 2.1 + PKCE, kelola bearer token, dan atur tool yang boleh dipanggil AI.",

  ui: {
    icon: "Cable",
    path: "/dashboard/create-your-mcp",
    component: "CreateYourMcpPage",
    category: "administration",
    order: 62,
  },

  technical: {
    featureType: "optional",
    hasUI: true,
    // Convex backend vendored at convex/features/createYourMcp/ (oauthCodes
    // + oauthAccessTokens tables, PKCE + mutations + queries). The frontend
    // route templates reach it via a stubbed HTTP client for now.
    hasConvex: true,
    hasTests: false,
    version: "0.1.0",
  },

  // Non-functional scaffold: UI + route templates compile, but the convex
  // HTTP client is stubbed. Marked ready so the admin page is reachable.
  status: {
    state: "beta",
    isReady: true,
  },

  permissions: [
    "create-your-mcp.view",
    "create-your-mcp.manage",
  ],

  bundles: {
    core: [],
    recommended: [],
    optional: ["custom"],
  },

  tags: ["ai", "mcp", "oauth", "pkce", "chatgpt", "claude", "cursor", "integration"],
})

export default createYourMcpConfig
export { createYourMcpConfig }
