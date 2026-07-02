import { defineTable } from "convex/server"
import { v } from "convex/values"

/**
 * Workspace-scoped configuration that lets a feature slice render
 * external content (iframe / Google Sheets / REST JSON / RSS) instead of
 * coupling to a Convex-internal pipeline. One row per (workspaceId,
 * featureId) — `setSource` upserts.
 *
 * `kind` discriminates the renderer; per-kind options live in shape-typed
 * optional columns rather than `v.any()` so the schema stays validated.
 */
export const externalDataSourcesTables = {
  externalDataSources: defineTable({
    workspaceId: v.id("workspaces"),
    featureId: v.string(),
    kind: v.union(
      v.literal("iframe"),
      v.literal("sheets"),
      v.literal("rest"),
      v.literal("rss"),
    ),
    label: v.optional(v.string()),

    iframeUrl: v.optional(v.string()),
    iframeHeightClass: v.optional(v.string()),
    iframeSandbox: v.optional(v.string()),

    sheetId: v.optional(v.string()),
    sheetTab: v.optional(v.string()),
    sheetRange: v.optional(v.string()),

    restUrl: v.optional(v.string()),
    restHeaders: v.optional(v.string()),
    restJsonPath: v.optional(v.string()),

    rssUrl: v.optional(v.string()),
    rssLimit: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
    createdBy: v.id("users"),
    updatedBy: v.id("users"),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_feature", ["workspaceId", "featureId"]),
}
