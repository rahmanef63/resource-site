/**
 * Analytics Feature Schema
 * Provides analytics and insights functionality
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

export const analyticsTables = {
  // Analytics events for tracking
  analyticsEvents: defineTable({
    eventType: v.string(), // e.g., "page_view", "feature_used", "action_completed"
    eventName: v.string(),
    properties: v.optional(v.record(v.string(), v.any())),
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    workspaceId: v.id("workspaces"),
    timestamp: v.number(),
    metadata: v.optional(v.object({
      userAgent: v.optional(v.string()),
      referrer: v.optional(v.string()),
      path: v.optional(v.string()),
    })),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_type", ["workspaceId", "eventType"])
    .index("by_workspace_timestamp", ["workspaceId", "timestamp"])
    .index("by_user", ["userId"]),

  // Analytics dashboard widgets configuration
  analyticsWidgets: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("metric"),
      v.literal("chart"),
      v.literal("table"),
      v.literal("trend")
    ),
    config: v.object({
      dataSource: v.string(), // e.g., "tasks", "members", "activity"
      metric: v.string(), // e.g., "count", "sum", "average"
      filters: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
      }))),
      groupBy: v.optional(v.string()),
      timeRange: v.optional(v.union(
        v.literal("today"),
        v.literal("7d"),
        v.literal("30d"),
        v.literal("90d"),
        v.literal("custom")
      )),
      chartType: v.optional(v.union(
        v.literal("line"),
        v.literal("bar"),
        v.literal("pie"),
        v.literal("area"),
        v.literal("donut")
      )),
    }),
    position: v.object({
      x: v.number(),
      y: v.number(),
      w: v.number(),
      h: v.number(),
    }),
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"]),

  // Saved reports
  analyticsReports: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal("summary"),
      v.literal("detailed"),
      v.literal("comparison"),
      v.literal("trend")
    ),
    config: v.object({
      dataSources: v.array(v.string()),
      metrics: v.array(v.string()),
      dimensions: v.optional(v.array(v.string())),
      filters: v.optional(v.array(v.object({
        field: v.string(),
        operator: v.string(),
        value: v.any(),
      }))),
      timeRange: v.object({
        type: v.string(),
        start: v.optional(v.number()),
        end: v.optional(v.number()),
      }),
    }),
    schedule: v.optional(v.object({
      frequency: v.union(
        v.literal("daily"),
        v.literal("weekly"),
        v.literal("monthly")
      ),
      recipients: v.array(v.string()),
      lastSent: v.optional(v.number()),
    })),
    workspaceId: v.id("workspaces"),
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"]),
};

export default analyticsTables;
