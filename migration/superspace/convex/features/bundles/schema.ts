/**
 * Bundle Categories Schema
 * 
 * Defines the schema for workspace bundle categories that can be dynamically
 * configured by platform admins. Features can be tagged with multiple bundles.
 * 
 * This replaces the static BUNDLE_METADATA with a database-driven approach.
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Bundle Categories Table
 * 
 * Each row represents a bundle category that features can belong to.
 * Platform admins can create, edit, and delete bundle categories.
 */
export const bundleCategoriesTable = defineTable({
  // Unique bundle identifier (e.g., "startup", "business-pro")
  // This is the key used in feature configs
  bundleId: v.string(),
  
  // Display properties (editable by platform admin)
  name: v.string(),
  description: v.string(),
  icon: v.string(),
  
  // Categorization
  category: v.union(
    v.literal("productivity"),
    v.literal("business"),
    v.literal("personal"),
    v.literal("creative"),
    v.literal("education"),
    v.literal("community")
  ),
  
  // Theme/styling
  primaryColor: v.optional(v.string()),
  accentColor: v.optional(v.string()),
  
  // Recommended workspace types
  recommendedFor: v.array(v.union(
    v.literal("personal"),
    v.literal("family"),
    v.literal("group"),
    v.literal("organization"),
    v.literal("institution")
  )),
  
  // Tags for searchability
  tags: v.array(v.string()),
  
  // Visibility & ordering
  isEnabled: v.boolean(),
  isPublic: v.boolean(),
  order: v.number(),
  
  // System bundle flag - if true, cannot be deleted
  isSystem: v.optional(v.boolean()),
  
  // Audit fields
  createdBy: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedBy: v.optional(v.id("users")),
  updatedAt: v.optional(v.number()),
})
  .index("by_bundle_id", ["bundleId"])
  .index("by_category", ["category"])
  .index("by_enabled", ["isEnabled"])
  .index("by_order", ["order"]);

/**
 * Feature Bundle Memberships Table
 * 
 * Maps features to bundle categories with their role (core/recommended/optional).
 * This allows dynamic assignment of features to bundles via the platform admin.
 */
export const featureBundleMembershipsTable = defineTable({
  // Reference to system feature
  featureId: v.string(),
  
  // Reference to bundle category
  bundleId: v.string(),
  
  // Role in the bundle
  role: v.union(
    v.literal("core"),        // Always enabled, cannot be disabled
    v.literal("recommended"), // Enabled by default, can be disabled
    v.literal("optional")     // Disabled by default, can be enabled
  ),
  
  // Order within the bundle
  order: v.optional(v.number()),
  
  // Audit fields
  createdBy: v.optional(v.id("users")),
  createdAt: v.number(),
  updatedBy: v.optional(v.id("users")),
  updatedAt: v.optional(v.number()),
})
  .index("by_feature", ["featureId"])
  .index("by_bundle", ["bundleId"])
  .index("by_feature_bundle", ["featureId", "bundleId"])
  .index("by_bundle_role", ["bundleId", "role"]);

export const bundleTables = {
  bundleCategories: bundleCategoriesTable,
  featureBundleMemberships: featureBundleMembershipsTable,
};
