import { defineTable } from "convex/server"
import { v } from "convex/values"

/**
 * Platform Admin — error reports
 *
 * Captures user-submitted error tickets from in-app error handlers
 * (ConvexErrorBoundary fallback + ConvexErrorAlert). Reported by any
 * signed-in user; reviewed only by platform admins.
 */
export const errorReports = defineTable({
  reporterUserId: v.id("users"),
  workspaceId: v.optional(v.id("workspaces")),
  status: v.union(
    v.literal("open"),
    v.literal("triaged"),
    v.literal("resolved"),
    v.literal("wontfix"),
  ),
  severity: v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
    v.literal("critical"),
  ),
  title: v.string(),
  userNote: v.optional(v.string()),
  errorMessage: v.string(),
  errorName: v.optional(v.string()),
  errorStack: v.optional(v.string()),
  route: v.optional(v.string()),
  endpoint: v.optional(v.string()),
  featureId: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  appVersion: v.optional(v.string()),
  viewport: v.optional(
    v.object({
      w: v.number(),
      h: v.number(),
    }),
  ),
  screenshotFileId: v.optional(v.id("fileAttachments")),
  triagedBy: v.optional(v.id("users")),
  triagedAt: v.optional(v.number()),
  resolutionNote: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_status", ["status"])
  .index("by_severity", ["severity"])
  .index("by_reporter", ["reporterUserId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_created", ["createdAt"])

export const platformAdminTables = {
  errorReports,
}

export default platformAdminTables
