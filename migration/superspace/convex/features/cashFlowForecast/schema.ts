import { defineTable } from "convex/server"
import { v } from "convex/values"

export const cashFlowForecastTables = {
  cashFlowForecasts: defineTable({
    workspaceId: v.id("workspaces"),
    branchId: v.optional(v.string()),
    horizonDays: v.number(), // 30|60|90
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),
    baseCash: v.number(),
    projectedInflow: v.number(),
    projectedOutflow: v.number(),
    projectedClosing: v.number(),
    confidence: v.optional(v.number()), // 0-100
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
    generatedBy: v.id("users"),
    generationSource: v.union(
      v.literal("manual"),
      v.literal("recurring-derived"),
      v.literal("ai-assisted"),
    ),
    aiNotes: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_horizon", ["workspaceId", "horizonDays"])
    .index("by_workspace_status", ["workspaceId", "status"]),

  cashFlowLineItems: defineTable({
    workspaceId: v.id("workspaces"),
    forecastId: v.id("cashFlowForecasts"),
    bucket: v.union(
      v.literal("recurring-revenue"),
      v.literal("one-off-revenue"),
      v.literal("expense-fixed"),
      v.literal("expense-variable"),
      v.literal("capex"),
    ),
    label: v.string(),
    amount: v.number(),
    probability: v.optional(v.number()), // 0-100
    expectedDate: v.optional(v.string()),
    note: v.optional(v.string()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_forecast", ["forecastId"])
    .index("by_forecast_bucket", ["forecastId", "bucket"]),
}

export default cashFlowForecastTables
