import { defineTable } from "convex/server"
import { v } from "convex/values"

/**
 * Per-workspace remote data-source credentials.
 *
 * Stores admin keys for connecting an Owner-managed workspace to an
 * external Convex deployment (e.g. rc-samata-dash) or — once new source
 * types ship — REST/GraphQL endpoints.
 *
 * Security model:
 * - Keys live in this table as opaque strings; self-hosted Convex on
 *   Dokploy = filesystem-encrypted at storage layer (user-owned infra).
 *   Do NOT return the raw key from any query. Mutations accept the new
 *   key; queries return only a 4-char tail.
 * - Only workspace `MANAGE` permission (Owner) can write.
 * - Every set / delete / probe writes an audit event.
 * - URLs validated to https:// scheme + no local/internal IPs.
 */
export const dataSourcesTables = {
  workspaceDataSources: defineTable({
    workspaceId: v.id("workspaces"),
    /** Connection kind. Forward-compatible — new types ship later. */
    type: v.union(v.literal("convex_source")),
    /** Free-text label set by the owner. */
    name: v.string(),
    /** Remote endpoint base URL (no trailing slash). MUST be https://. */
    endpointUrl: v.string(),
    /** Admin / API key. Never returned by any query. */
    adminKey: v.string(),
    /** Connection status — set by testDataSource action. */
    status: v.union(
      v.literal("untested"),
      v.literal("connected"),
      v.literal("error"),
      v.literal("disabled"),
    ),
    /** Optional error message when status === "error". */
    lastError: v.optional(v.string()),
    /** Last successful probe / sync timestamp (ms). */
    lastTestedAt: v.optional(v.number()),
    /** Last successful row pull, if a sync ran. */
    lastSyncAt: v.optional(v.number()),
    /** Optional row count from the last sync. */
    lastSyncRows: v.optional(v.number()),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"]),
}

export default dataSourcesTables
