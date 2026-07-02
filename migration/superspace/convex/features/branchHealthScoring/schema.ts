import { defineTable } from "convex/server"
import { v } from "convex/values"

export const branchHealthScoringTables = {
  branchHealthSnapshots: defineTable({
    workspaceId: v.id("workspaces"),
    branchId: v.string(),
    capturedAt: v.number(),
    period: v.string(), // YYYY-MM or YYYY-MM-DD
    revenueScore: v.number(),
    expenseScore: v.number(),
    opsScore: v.number(),
    staffScore: v.number(),
    customerScore: v.number(),
    compositeScore: v.number(),
    insights: v.optional(v.string()), // AI-generated text
    insightsModel: v.optional(v.string()),
    weights: v.object({
      revenue: v.number(),
      expense: v.number(),
      ops: v.number(),
      staff: v.number(),
      customer: v.number(),
    }),
    metricsSnapshot: v.optional(
      v.object({
        revenue: v.optional(v.number()),
        grossMargin: v.optional(v.number()),
        attendanceRate: v.optional(v.number()),
        complaintCount: v.optional(v.number()),
        damageCount: v.optional(v.number()),
      }),
    ),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_branch", ["workspaceId", "branchId"])
    .index("by_workspace_period", ["workspaceId", "period"]),
}

export default branchHealthScoringTables
