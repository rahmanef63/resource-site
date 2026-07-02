/**
 * Custom Features Schema
 * 
 * Schema for user-created features via the Builder.
 * Feature owners have admin access to features they create.
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Custom features created by users via Builder
 */
export const customFeatures = defineTable({
  // Feature identity
  featureId: v.string(), // Unique slug like "my-custom-crm"
  name: v.string(),
  description: v.string(),
  
  // Ownership
  createdBy: v.id("users"), // The Feature Owner
  workspaceId: v.id("workspaces"), // Where it was created
  
  // Status management
  status: v.union(
    v.literal("development"), // Being built
    v.literal("beta"),        // Testing phase
    v.literal("stable"),      // Production ready
    v.literal("deprecated"),  // Marked for removal
    v.literal("disabled")     // Temporarily disabled
  ),
  version: v.string(), // Semver format: "1.0.0"
  isPublic: v.boolean(), // Can other workspaces use it?
  
  // Feature configuration (mirrors defineFeature schema)
  config: v.object({
    ui: v.object({
      icon: v.string(),
      path: v.string(),
      category: v.string(),
      order: v.number(),
    }),
    technical: v.object({
      featureType: v.union(
        v.literal("default"),
        v.literal("system"),
        v.literal("optional"),
        v.literal("experimental")
      ),
      hasUI: v.boolean(),
      hasConvex: v.boolean(),
    }),
  }),
  
  // Builder data (for rendering the feature)
  builderData: v.optional(v.object({
    nodes: v.optional(v.any()), // React Flow nodes
    edges: v.optional(v.any()), // React Flow edges
    components: v.optional(v.any()), // Component definitions
  })),
  
  // Metadata
  createdAt: v.number(),
  updatedAt: v.number(),
  publishedAt: v.optional(v.number()), // When it became stable
  
  // Optional fields
  tags: v.optional(v.array(v.string())),
  dependencies: v.optional(v.array(v.string())), // Other feature IDs
  readme: v.optional(v.string()), // Documentation
})
  .index("by_feature_id", ["featureId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_creator", ["createdBy"])
  .index("by_status", ["status"])
  .index("by_public", ["isPublic"]);

/**
 * Feature access control
 * Controls which workspaces can access which features
 */
export const featureAccess = defineTable({
  featureId: v.string(), // Custom feature ID or system feature ID
  workspaceId: v.id("workspaces"),
  
  accessLevel: v.union(
    v.literal("owner"),    // Full control (creator)
    v.literal("admin"),    // Can configure
    v.literal("user"),     // Can use
    v.literal("disabled")  // Explicitly disabled
  ),
  
  // Configuration overrides for this workspace
  configOverrides: v.optional(v.object({
    order: v.optional(v.number()),
    enabled: v.optional(v.boolean()),
    customSettings: v.optional(v.any()),
  })),
  
  // Audit fields
  grantedBy: v.id("users"),
  grantedAt: v.number(),
  updatedAt: v.optional(v.number()),
})
  .index("by_feature", ["featureId"])
  .index("by_workspace", ["workspaceId"])
  .index("by_feature_workspace", ["featureId", "workspaceId"])
  .index("by_access_level", ["accessLevel"]);

/**
 * Feature versions history
 * Track version changes for rollback capability
 */
export const featureVersions = defineTable({
  featureId: v.string(),
  version: v.string(), // Semver
  
  // Snapshot of the feature at this version
  snapshot: v.object({
    config: v.any(),
    builderData: v.optional(v.any()),
  }),
  
  // Release info
  releaseNotes: v.optional(v.string()),
  isStable: v.boolean(),
  
  // Audit
  createdBy: v.id("users"),
  createdAt: v.number(),
})
  .index("by_feature", ["featureId"])
  .index("by_feature_version", ["featureId", "version"]);

/**
 * Export all tables
 */
export const customFeaturesTables = {
  customFeatures,
  featureAccess,
  featureVersions,
};
