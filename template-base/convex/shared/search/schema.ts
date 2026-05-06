/**
 * Shared Search Feature Schema
 * Provides unified search functionality across all ERP modules
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Saved search configurations
  savedSearches: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    query: v.string(),
    entities: v.array(v.string()),
    filters: v.optional(v.array(v.any())),
    sort: v.optional(v.any()),
    tags: v.array(v.string()),
    isPublic: v.boolean(),
    usageCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_workspace", ["workspaceId", "createdAt"])
    .index("by_entity", ["entities", "createdAt"]),

  // Search history for autocomplete and analytics
  searchHistory: defineTable({
    userId: v.id("users"),
    workspaceId: v.id("workspaces"),
    query: v.string(),
    resultsCount: v.number(),
    entities: v.array(v.string()),
    timestamp: v.number(),
    source: v.optional(v.string()), // "dashboard", "module", etc.
  })
    .index("by_user_timestamp", ["userId", "timestamp"])
    .index("by_workspace", ["workspaceId", "timestamp"]),

  // Search analytics and suggestions
  searchAnalytics: defineTable({
    workspaceId: v.id("workspaces"),
    query: v.string(),
    searchCount: v.number(),
    avgResults: v.number(),
    lastSearched: v.number(),
    popularEntities: v.array(v.string()),
  })
    .index("by_workspace", ["workspaceId", "searchCount"])
    .index("by_query", ["query"]),

  // Search index configuration per entity
  searchIndexConfig: defineTable({
    entity: v.string(),
    fields: v.array(v.string()),
    weightings: v.optional(v.record(v.string(), v.number())),
    filters: v.optional(v.array(v.string())),
    permissions: v.optional(v.array(v.string())),
    isActive: v.boolean(),
    lastIndexed: v.optional(v.number()),
  })
    .index("by_entity", ["entity"]),
});