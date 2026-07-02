/**
 * System Features Schema
 * 
 * Defines the schema for platform-level features that are controlled by platform admins.
 * These features are shown in Menu Store and can have their labels, versions, and visibility
 * dynamically updated by platform admins.
 * 
 * Features are stored with just an ID - all display properties (name, description, version)
 * are controlled dynamically by platform admins via this table.
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * System Features Table
 * 
 * Each row represents a feature that can be installed in workspaces.
 * Platform admins can edit all properties including name, version, visibility.
 */
export const systemFeaturesTable = defineTable({
  // Unique feature identifier (e.g., "chat", "calls", "reports")
  // This never changes - it's the internal ID
  featureId: v.string(),
  
  // Dynamic display properties (editable by platform admin)
  name: v.string(),
  description: v.string(),
  icon: v.string(),
  version: v.string(),
  
  // Feature categorization
  category: v.union(
    v.literal("communication"),
    v.literal("productivity"),
    v.literal("collaboration"),
    v.literal("administration"),
    v.literal("social"),
    v.literal("creativity"),
    v.literal("analytics"),
    v.literal("content")
  ),
  
  // Feature type
  featureType: v.union(
    v.literal("default"),   // Always shown in sidebar
    v.literal("optional"),  // Can be installed from Menu Store
    v.literal("system"),    // Admin-only features
    v.literal("experimental") // Beta/experimental features
  ),
  
  // Feature status
  status: v.union(
    v.literal("stable"),
    v.literal("beta"),
    v.literal("development"),
    v.literal("experimental"),
    v.literal("deprecated"),
    v.literal("disabled")
  ),
  
  // Visibility controls
  isEnabled: v.boolean(),        // Whether feature is available globally
  isPublic: v.boolean(),         // Whether shown in Menu Store to all users
  isReady: v.boolean(),          // Whether feature is ready for use
  
  // Optional metadata
  tags: v.optional(v.array(v.string())),
  requiresPermission: v.optional(v.string()),
  expectedRelease: v.optional(v.string()),
  releaseNotes: v.optional(v.string()),
  
  // Component mapping (which React component renders this feature)
  component: v.optional(v.string()),
  path: v.optional(v.string()),
  
  // Ordering
  order: v.number(),
  
  // Audit fields
  createdBy: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedBy: v.optional(v.id("users")),
  updatedAt: v.optional(v.number()),
})
  .index("by_feature_id", ["featureId"])
  .index("by_category", ["category"])
  .index("by_status", ["status"])
  .index("by_feature_type", ["featureType"])
  .index("by_enabled_public", ["isEnabled", "isPublic"])
  .index("by_order", ["order"]);

/**
 * Feature Version History
 * Track changes to features over time
 */
export const featureVersionHistoryTable = defineTable({
  featureId: v.string(),
  version: v.string(),
  previousVersion: v.optional(v.string()),
  
  // Snapshot of feature state at this version
  name: v.string(),
  description: v.string(),
  releaseNotes: v.optional(v.string()),
  
  // Who made the change
  changedBy: v.optional(v.id("users")),
  changedAt: v.number(),
  
  // Type of change
  changeType: v.union(
    v.literal("created"),
    v.literal("updated"),
    v.literal("deprecated"),
    v.literal("enabled"),
    v.literal("disabled")
  ),
})
  .index("by_feature", ["featureId"])
  .index("by_feature_version", ["featureId", "version"]);

export const systemFeaturesTables = {
  systemFeatures: systemFeaturesTable,
  featureVersionHistory: featureVersionHistoryTable,
};
