/**
 * Integrations Feature Schema
 * Provides third-party integrations functionality
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const integrationsTables = {
  // Integrations
  integrations: defineTable({
    integrationId: v.string(), // e.g., "slack", "google-calendar"
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("error")
    ),
    config: v.optional(v.record(v.string(), v.any())),
    credentials: v.optional(v.object({
      accessToken: v.optional(v.string()),
      refreshToken: v.optional(v.string()),
      expiresAt: v.optional(v.number()),
      scope: v.optional(v.string()),
    })),
    webhookUrl: v.optional(v.string()),
    webhookSecret: v.optional(v.string()),
    lastSyncAt: v.optional(v.number()),
    syncFrequency: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    metadata: v.optional(v.record(v.string(), v.any())),
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_integration_id", ["integrationId"])
    .index("by_status", ["status"]),

  // OAuth state tokens for CSRF protection during authorization flow.
  // Issued by getOAuthUrl, verified + consumed by handleCallback.
  oauthStates: defineTable({
    state: v.string(),
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    integrationType: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
    consumed: v.boolean(),
  })
    .index("by_state", ["state"])
    .index("by_workspace", ["workspaceId"]),

  // Integration events log
  integrationEvents: defineTable({
    integrationId: v.id("integrations"),
    eventType: v.string(),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    status: v.union(
      v.literal("success"),
      v.literal("failed"),
      v.literal("pending")
    ),
    payload: v.optional(v.any()),
    response: v.optional(v.any()),
    errorMessage: v.optional(v.string()),
    workspaceId: v.id("workspaces"),
    timestamp: v.number(),
  })
    .index("by_integration", ["integrationId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_timestamp", ["timestamp"]),
};

export default integrationsTables;
