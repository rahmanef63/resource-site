import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  copies: defineTable({
    // Workspace context
    workspaceId: v.string(),
    // Unique key for this copy block
    key: v.string(),
    // Group/category for organization
    group: v.string(),
    // Copy status (published, draft, archived)
    status: v.string(),
    // Translations by locale
    translations: v.record(v.string(), v.object({
      content: v.string(),
      description: v.optional(v.string()),
      updatedAt: v.number(),
      updatedBy: v.optional(v.string()),
    })),
    // Metadata fields
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    lastReviewedAt: v.optional(v.number()),
    lastReviewedBy: v.optional(v.string()),
    // Standard metadata
    createdBy: v.optional(v.union(v.string(), v.null())),
    updatedBy: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_key", ["workspaceId", "key"])
    .index("by_group", ["workspaceId", "group"])
    .index("by_status", ["workspaceId", "status"]),

  copyGroups: defineTable({
    // Workspace context
    workspaceId: v.string(),
    // Group name/identifier
    name: v.string(),
    // Display name in different locales
    displayNames: v.record(v.string(), v.string()),
    // Optional description
    description: v.optional(v.string()),
    // Group status
    status: v.string(),
    // Copy count in this group
    copyCount: v.number(),
    // Standard metadata
    createdBy: v.optional(v.union(v.string(), v.null())),
    updatedBy: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_name", ["workspaceId", "name"])
    .index("by_status", ["workspaceId", "status"]),

  copyHistory: defineTable({
    // Reference to the copy
    copyId: v.id("copies"),
    // Locale that was updated
    locale: v.string(),
    // Previous content
    previousContent: v.string(),
    // Change description
    changeNote: v.optional(v.string()),
    // Standard metadata
    createdBy: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_copy", ["copyId"]),
} as const;
