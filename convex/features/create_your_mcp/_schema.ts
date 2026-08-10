// Schema fragment for the create-your-mcp slice.
//
// Compose into the consumer's root convex/_schema.ts:
//
//   import { createYourMcpTables } from "./features/create_your_mcp/_schema";
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
  //
  // Only the sha256 digest is stored. The raw code exists in flight
  // between the consent redirect and the token exchange, and nowhere
  // else. There is no `consumed` flag: the row is DELETED on exchange,
  // so a replay finds nothing (same opaque invalid_grant) and the table
  // does not grow one dead row per successful login forever.
  oauthCodes: defineTable({
    codeHash: v.string(),
    codeChallenge: v.string(),
    codeChallengeMethod: v.string(),
    redirectUri: v.string(),
    clientId: v.string(),
    scope: v.optional(v.string()),
    resource: v.optional(v.string()),
    userId: v.id("users"),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_code_hash", ["codeHash"])
    .index("by_user_time", ["userId", "createdAt"]),

  // Long-lived access tokens issued after successful code exchange.
  // The MCP route validates Bearer against this table on every call.
  // 1-year TTL default — rotate via revokeToken if leaked.
  //
  // Only the sha256 digest is stored; the raw bearer is returned to the
  // client exactly once, at mint. A database dump therefore contains no
  // usable credential, and the admin list has nothing to redact.
  oauthAccessTokens: defineTable({
    tokenHash: v.string(),
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
    .index("by_hash", ["tokenHash"])
    .index("by_user_time", ["userId", "createdAt"]),
};
