import { defineTable, defineSchema } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  features: defineTable({
    workspaceId: v.string(),
    key: v.string(), // Unique identifier for the feature
    status: v.string(), // active, inactive, draft
    type: v.string(), // core, addon, experimental, etc.
    displayOrder: v.number(),
    translations: v.record(v.string(), v.object({
      title: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
    })),
    settings: v.optional(v.record(v.string(), v.any())), // Feature-specific settings
    requiredRoles: v.optional(v.array(v.string())), // Required roles to access
    dependencies: v.optional(v.array(v.string())), // Other features this depends on
    metadata: v.optional(v.object({
      version: v.optional(v.string()),
      lastTestedAt: v.optional(v.number()),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
    createdAt: v.number(),
    createdBy: v.optional(v.string()),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_status", ["workspaceId", "status"])
  .index("by_workspace_type", ["workspaceId", "type"])
  .index("by_display_order", ["workspaceId", "displayOrder"]),

  featureGroups: defineTable({
    workspaceId: v.string(),
    name: v.string(), // Unique identifier for the group
    status: v.string(), // active, inactive
    displayOrder: v.number(),
    translations: v.record(v.string(), v.object({
      title: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
    })),
    features: v.array(v.string()), // List of feature keys in this group
    metadata: v.optional(v.object({
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_name", ["workspaceId", "name"])
  .index("by_display_order", ["workspaceId", "displayOrder"]),
});
