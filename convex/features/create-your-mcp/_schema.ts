// Schema fragment for the create-your-mcp slice.
//
// Compose into the consumer's root convex/_schema.ts:
//
//   import { createYourMcpTables } from "./features/create-your-mcp/_schema";
//   export default defineSchema({ ...createYourMcpTables, ...others });
//
// OAuth 2.1 + PKCE state for AI-client custom-app flows
// (ChatGPT custom apps, Claude.ai connectors, Cursor MCP, etc.).
// Spec: https://datatracker.ietf.org/doc/html/rfc7636
// MCP auth: https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const createYourMcpTables = {
  // Ephemeral authorization codes — minted at /oauth/authorize after
  // admin consent, redeemed at /api/oauth/token. Always single-use.
  oauthCodes: defineTable({
    code: v.string(),
    codeChallenge: v.string(),
    codeChallengeMethod: v.string(),
    redirectUri: v.string(),
    clientId: v.string(),
    scope: v.optional(v.string()),
    resource: v.optional(v.string()),
    userId: v.id("users"),
    expiresAt: v.number(),
    consumed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_code", ["code"])
    .index("by_user_time", ["userId", "createdAt"]),

  // Long-lived access tokens issued after successful code exchange.
  // The MCP route validates Bearer against this table on every call.
  // 1-year TTL default — rotate via revokeToken if leaked.
  oauthAccessTokens: defineTable({
    token: v.string(),
    userId: v.id("users"),
    clientId: v.string(),
    scope: v.optional(v.string()),
    resource: v.optional(v.string()),
    expiresAt: v.number(),
    createdAt: v.number(),
    lastUsedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    label: v.optional(v.string()),
  })
    .index("by_token", ["token"])
    .index("by_user_time", ["userId", "createdAt"]),
};
