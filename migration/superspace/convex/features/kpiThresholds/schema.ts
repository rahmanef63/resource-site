import { defineTable } from "convex/server"
import { v } from "convex/values"

export const kpiThresholdsTables = {
  kpiThresholds: defineTable({
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    kpiKey: v.string(), // e.g. "daily_sales", "food_cost_pct"
    metric: v.string(), // human-readable
    direction: v.union(
      v.literal("above"),
      v.literal("below"),
      v.literal("outside-range"),
      v.literal("inside-range"),
    ),
    value1: v.number(),
    value2: v.optional(v.number()), // for range
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    actionPolicy: v.array(
      v.union(v.literal("notify"), v.literal("email"), v.literal("trigger-workflow")),
    ),
    isActive: v.boolean(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_kpi", ["workspaceId", "kpiKey"])
    .index("by_workspace_active", ["workspaceId", "isActive"]),

  kpiAlerts: defineTable({
    workspaceId: v.id("workspaces"),
    thresholdId: v.id("kpiThresholds"),
    branchId: v.optional(v.string()),
    triggeredAt: v.number(),
    actualValue: v.number(),
    severity: v.union(v.literal("info"), v.literal("warning"), v.literal("critical")),
    resolved: v.boolean(),
    resolvedBy: v.optional(v.id("users")),
    resolvedAt: v.optional(v.number()),
    resolutionNote: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_threshold", ["thresholdId"])
    .index("by_workspace_resolved", ["workspaceId", "resolved"]),
}

export default kpiThresholdsTables
