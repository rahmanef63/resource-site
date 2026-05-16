/**
 * create-your-mcp slice contract.
 *
 * Full vertical: Convex backend (oauth tables + PKCE + admin queries) +
 * frontend admin view + two Next.js API route templates (drop into
 * app/api/mcp/route.ts and app/api/oauth/token/route.ts).
 *
 * Auth is OAuth 2.1 + PKCE for AI-client flows + a static MCP_API_KEY
 * env bearer for service-account / CI access. Both paths route through
 * requireAdmin downstream.
 */

import { defineSliceContract } from "@/packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "create-your-mcp",
  version: "0.1.0",
  category: "ai",
  kind: "full",
  provides: {
    components: ["McpAdminView"],
    utils: [
      "dispatchJsonRpc",
      "checkAuth",
      "extractBearer",
      "scopeAllows",
      "runWithMcpContext",
      "getMcpContext",
    ],
    hooks: [],
    convex: {
      tables: ["oauthCodes", "oauthAccessTokens"],
      rbac: ["admin"],
    },
  },
  requires: {
    deps: [{ npm: "convex", range: "^1.16.0" }],
    shadcn: [],
    env: [],
    peers: [{ slug: "convex-auth", range: "^0.1" }],
  },
  conflicts: [],
});
