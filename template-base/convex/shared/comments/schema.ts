/**
 * Comments Schema
 * Provides commenting functionality across all ERP modules
 * Aligned with docs/api/schema.ts comments table structure
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Comments
  comments: defineTable({
    workspaceId: v.id("workspaces"),

    // Reference to the commented entity
    entityType: v.string(), // e.g., "document", "page", "task", "project", "file", "dbRow"
    entityId: v.string(), // Changed to string to match docs schema

    // Author
    authorId: v.id("users"), // Changed from createdBy to authorId for consistency

    // Comment content
    content: v.string(),

    // Thread management (parent/child)
    parentId: v.optional(v.id("comments")),

    // Status
    isResolved: v.boolean(),

    // Metadata
    mentions: v.optional(v.array(v.id("users"))),
    attachments: v.optional(v.array(v.id("_storage"))),

    // Position in document (for inline comments)
    position: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),

    // Additional metadata
    metadata: v.optional(v.any()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentId"]),

  // Comment subscriptions
  commentSubscriptions: defineTable({
    workspaceId: v.id("workspaces"),

    // Subscription details
    userId: v.id("users"),
    entityType: v.string(),
    entityId: v.string(), // Changed to string for consistency

    // Notification preferences
    isActive: v.boolean(),
    notifyOnReply: v.boolean(),
    notifyOnMention: v.boolean(),
    notifyOnAll: v.boolean(),

    // Subscription metadata
    subscribedAt: v.number(),
    lastNotifiedAt: v.optional(v.number()),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_user", ["userId"])
    .index("by_entity", ["entityType", "entityId"]),

  // Comment threads summary
  commentThreads: defineTable({
    workspaceId: v.id("workspaces"),

    // Thread reference
    entityType: v.string(),
    entityId: v.string(), // Changed to string for consistency

    // Thread statistics
    commentCount: v.number(),
    participantCount: v.number(),
    lastCommentAt: v.number(),
    lastCommentBy: v.id("users"),

    // Thread status
    isResolved: v.boolean(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("users")),

    // Thread priority
    priority: v.optional(v.union(
      v.literal("low"),
      v.literal("normal"),
      v.literal("high"),
      v.literal("urgent")
    )),

    // Assignees
    assignees: v.array(v.id("users")),

    // Metadata
    tags: v.array(v.string()),

    // Audit
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_entity", ["entityType", "entityId"]),

  // Comment analytics
  commentAnalytics: defineTable({
    workspaceId: v.id("workspaces"),
    period: v.union(
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    date: v.number(),

    // Comment metrics
    totalComments: v.number(),
    uniqueCommenters: v.number(),
    averageCommentsPerThread: v.number(),

    // Engagement metrics
    totalReactions: v.number(),
    totalReplies: v.number(),
    averageResponseTime: v.number(), // in minutes

    // Resolution metrics
    resolvedThreads: v.number(),
    averageResolutionTime: v.number(), // in hours

    // Top entities
    mostCommentedEntities: v.array(v.object({
      entityType: v.string(),
      entityId: v.string(), // Changed to string
      count: v.number(),
    })),

    // Top commenters
    topCommenters: v.array(v.object({
      userId: v.id("users"),
      count: v.number(),
    })),

    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_period", ["period", "date"]),
});
