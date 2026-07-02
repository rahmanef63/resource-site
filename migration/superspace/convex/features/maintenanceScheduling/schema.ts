import { defineTable } from "convex/server"
import { v } from "convex/values"

export const maintenanceSchedulingTables = {
  maintenanceTasks: defineTable({
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    assetId: v.optional(v.id("managedAssets")),
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("preventive"), v.literal("reactive"), v.literal("inspection")),
    frequency: v.union(
      v.literal("once"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("yearly"),
    ),
    lastDoneAt: v.optional(v.number()),
    nextDueAt: v.number(),
    assignedTo: v.optional(v.id("users")),
    status: v.union(
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("overdue"),
      v.literal("skipped"),
    ),
    estimatedCost: v.optional(v.number()),
    actualCost: v.optional(v.number()),
    notes: v.optional(v.string()),
    completedBy: v.optional(v.id("users")),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"])
    .index("by_workspace_due", ["workspaceId", "nextDueAt"])
    .index("by_asset", ["assetId"])
    .index("by_assigned", ["assignedTo"]),
}

export default maintenanceSchedulingTables
