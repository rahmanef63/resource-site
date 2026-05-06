import { defineTable } from "convex/server";
import { v } from "convex/values";

export const workflows = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  trigger: v.union(
    v.literal("manual"),
    v.literal("schedule"),
    v.literal("event"),
  ),
  status: v.union(
    v.literal("draft"),
    v.literal("active"),
    v.literal("paused"),
    v.literal("archived"),
  ),
  definition: v.object({
    steps: v.array(
      v.object({
        id: v.string(),
        type: v.string(),
        config: v.any(),
        retryConfig: v.optional(v.object({
          maxAttempts: v.number(),
          backoffMs: v.number(),
        })),
        timeoutMs: v.optional(v.number()),
      }),
    ),
    settings: v.optional(v.object({
      slaDurationMs: v.optional(v.number()),
      maxRetries: v.optional(v.number()),
    })),
  }),
  createdBy: v.id("users"),
  metadata: v.optional(
    v.object({
      tags: v.optional(v.array(v.string())),
      lastRunAt: v.optional(v.number()),
      runCount: v.optional(v.number()),
    }),
  ),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_status", ["status"])
  .index("by_creator", ["createdBy"]);

export const workflowTemplates = defineTable({
  name: v.string(),
  description: v.string(),
  category: v.string(),
  definition: v.any(),
  isPublic: v.boolean(),
  createdBy: v.optional(v.id("users")),
})
  .index("by_category", ["category"]);

export const workflowExecutions = defineTable({
  workflowId: v.id("workflows"),
  workspaceId: v.id("workspaces"),
  status: v.union(
    v.literal("running"),
    v.literal("completed"),
    v.literal("failed"),
    v.literal("cancelled"),
  ),
  isDryRun: v.optional(v.boolean()),
  startedAt: v.number(),
  completedAt: v.optional(v.number()),
  triggeredBy: v.id("users"),
  logs: v.optional(
    v.array(
      v.object({
        timestamp: v.number(),
        level: v.string(),
        message: v.string(),
      }),
    ),
  ),
  result: v.optional(v.any()),
  error: v.optional(v.string()),
})
  .index("by_workflow", ["workflowId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_status", ["status"]);

export const studioTables = {
  workflows,
  workflowTemplates,
  workflowExecutions,
};
