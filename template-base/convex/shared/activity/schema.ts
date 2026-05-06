/**
 * Activity Feeds Schema
 * Provides activity logging and feed functionality across all ERP modules
 */

/**
 * Activity Feeds Schema
 * Provides activity logging and feed functionality across all ERP modules
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Activity logs
  activities: defineTable({
    workspaceId: v.id("workspaces"),

    // Actor information
    actorId: v.id("users"),
    actorType: v.union(v.literal("user"), v.literal("system"), v.literal("automation")),
    actorName: v.optional(v.string()), // For system/automation

    // Action details
    action: v.string(), // e.g., "created", "updated", "deleted", "viewed", "approved"
    verb: v.union(
      v.literal("created"),
      v.literal("updated"),
      v.literal("deleted"),
      v.literal("archived"),
      v.literal("restored"),
      v.literal("viewed"),
      v.literal("downloaded"),
      v.literal("shared"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("assigned"),
      v.literal("completed"),
      v.literal("commented"),
      v.literal("mentioned"),
      v.literal("subscribed"),
      v.literal("unsubscribed"),
      v.literal("exported"),
      v.literal("imported"),
      v.literal("login"),
      v.literal("logout")
    ),

    // Entity information
    entityType: v.string(), // e.g., "invoices", "tasks", "projects"
    entityId: v.id("_table"),
    entityName: v.optional(v.string()), // For display

    // Old and new values for changes
    oldValue: v.optional(v.any()),
    newValue: v.optional(v.any()),
    changedFields: v.optional(v.array(v.string())),

    // Metadata
    metadata: v.optional(v.record(v.string(), v.any())),
    tags: v.array(v.string()),

    // Visibility
    visibility: v.union(
      v.literal("public"),
      v.literal("workspace"),
      v.literal("team"),
      v.literal("private")
    ),

    // Target audience
    targetUsers: v.array(v.id("users")),
    targetRoles: v.array(v.string()),

    // Feed context
    feedId: v.optional(v.string()), // For grouping related activities
    parentId: v.optional(v.id("activities")), // For nested activities
    batchId: v.optional(v.string()), // For batch operations

    // Rich content
    message: v.optional(v.string()), // Formatted activity message
    attachments: v.array(v.id("_storage")), // Screenshots, documents
    mentions: v.array(v.id("users")),

    // Location/IP information
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    location: v.optional(v.object({
      country: v.string(),
      city: v.string(),
      lat: v.number(),
      lng: v.number(),
    })),

    // System flags
    isImportant: v.boolean(),
    isAutomated: v.boolean(),
    isDeleted: v.boolean(),

    // Engagement metrics
    viewCount: v.number(),
    likeCount: v.number(),
    commentCount: v.number(),

    // Timestamps
    timestamp: v.number(),
    createdAt: v.number(),
  }),

  // Activity subscriptions
  activitySubscriptions: defineTable({
    workspaceId: v.id("workspaces"),

    // Subscription details
    userId: v.id("users"),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.id("_table")),
    action: v.optional(v.array(v.string())),

    // Subscription preferences
    isActive: v.boolean(),
    isRealtime: v.boolean(),
    batchFrequency: v.union(
      v.literal("immediate"),
      v.literal("hourly"),
      v.literal("daily"),
      v.literal("weekly")
    ),

    // Notification channels
    inApp: v.boolean(),
    email: v.boolean(),
    push: v.boolean(),
    slack: v.optional(v.boolean()),
    webhook: v.optional(v.boolean()),

    // Filter criteria
    filters: v.array(v.object({
      field: v.string(),
      operator: v.union(
        v.literal("equals"),
        v.literal("not_equals"),
        v.literal("contains"),
        v.literal("in")
      ),
      value: v.any(),
    })),

    // Metadata
    name: v.optional(v.string()),
    description: v.optional(v.string()),

    // Audit
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Activity feeds
  activityFeeds: defineTable({
    workspaceId: v.id("workspaces"),

    // Feed configuration
    name: v.string(),
    description: v.optional(v.string()),
    feedType: v.union(
      v.literal("global"), // All workspace activities
      v.literal("entity"), // Specific entity activities
      v.literal("user"), // User-specific activities
      v.literal("team"), // Team activities
      v.literal("custom") // Custom filtered feed
    ),

    // Feed scope
    entityType: v.optional(v.string()),
    entityId: v.optional(v.id("_table")),
    userId: v.optional(v.id("users")),
    teamId: v.optional(v.string()),

    // Feed settings
    maxAge: v.optional(v.number()), // Max age of activities to keep (in days)
    maxItems: v.optional(v.number()), // Max items to display
    autoRefresh: v.boolean(),
    refreshInterval: v.optional(v.number()), // in seconds

    // Visibility
    isPublic: v.boolean(),
    allowedUsers: v.array(v.id("users")),
    allowedRoles: v.array(v.string()),

    // Default filters
    defaultFilters: v.array(v.object({
      field: v.string(),
      operator: v.string(),
      value: v.any(),
    })),

    // Statistics
    activityCount: v.number(),
    lastActivityAt: v.optional(v.number()),
    subscriberCount: v.number(),

    // Audit
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Activity analytics
  activityAnalytics: defineTable({
    workspaceId: v.id("workspaces"),
    period: v.union(
      v.literal("realtime"),
      v.literal("hourly"),
      v.literal("daily"),
      v.literal("weekly"),
      v.literal("monthly")
    ),
    date: v.number(), // Timestamp for period start

    // Activity metrics
    totalActivities: v.number(),
    uniqueUsers: v.number(),
    avgActivitiesPerUser: v.number(),

    // Action breakdown
    actionsByType: v.array(v.object({
      action: v.string(),
      count: v.number(),
      percentage: v.number(),
    })),

    // Entity breakdown
    activitiesByEntity: v.array(v.object({
      entityType: v.string(),
      count: v.number(),
      uniqueEntities: v.number(),
    })),

    // User activity
    topActiveUsers: v.array(v.object({
      userId: v.id("users"),
      count: v.number(),
    })),

    // Engagement metrics
    mostViewed: v.array(v.object({
      entityType: v.string(),
      entityId: v.id("_table"),
      views: v.number(),
    })),

    // Security metrics
    failedLogins: v.number(),
    suspiciousActivities: v.number(),
    accessFromNewIPs: v.number(),

    // Performance metrics
    avgResponseTime: v.optional(v.number()),
    systemErrors: v.number(),

    createdAt: v.number(),
  }),
});
