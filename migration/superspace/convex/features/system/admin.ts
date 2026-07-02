/**
 * System Features Admin Queries and Mutations
 * 
 * Platform admin controls for managing system features.
 * Only platform admins can modify these features.
 */

import { v } from "convex/values";
import { query, mutation, internalMutation } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { checkPlatformAdmin, requirePlatformAdmin } from "../lib/rbac";
import { OPTIONAL_FEATURES_CATALOG } from "../menus/optional_features_catalog";
import { DEFAULT_MENU_ITEMS } from "../menus/menu_manifest_data";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all system features (platform admin only for full list)
 */
export const getAllSystemFeatures = query({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await checkPlatformAdmin(ctx);
    
    const features = await ctx.db
      .query("systemFeatures")
      .withIndex("by_order")
      .take(1000);
    
    // Non-admins only see enabled public features
    if (!isAdmin) {
      return features.filter(f => f.isEnabled && f.isPublic);
    }
    
    return features;
  },
});

/**
 * Alias for getAllSystemFeatures - used by frontend hooks
 */
export const getSystemFeatures = query({
  args: {},
  handler: async (ctx) => {
    const isAdmin = await checkPlatformAdmin(ctx);
    
    const features = await ctx.db
      .query("systemFeatures")
      .withIndex("by_order")
      .take(1000);
    
    // Non-admins only see enabled public features
    if (!isAdmin) {
      return features.filter(f => f.isEnabled && f.isPublic);
    }
    
    return features;
  },
});

/**
 * Get available features for Menu Store
 * Returns features that are enabled and public
 */
export const getAvailableFeaturesForMenuStore = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Get features from systemFeatures table
    const systemFeatures = await ctx.db
      .query("systemFeatures")
      .withIndex("by_enabled_public", q => q.eq("isEnabled", true).eq("isPublic", true))
      .take(1000);
    
    // If no system features exist yet, fall back to OPTIONAL_FEATURES_CATALOG
    if (systemFeatures.length === 0) {
      return OPTIONAL_FEATURES_CATALOG.map(f => ({
        featureId: f.slug,
        slug: f.slug,
        name: f.name,
        description: f.description,
        icon: f.icon,
        version: f.version,
        category: f.category,
        featureType: f.featureType || "optional",
        status: f.status || "stable",
        isReady: f.isReady ?? true,
        tags: f.tags,
        requiresPermission: f.requiresPermission,
      }));
    }
    
    // Get currently installed menus in this workspace
    const installedMenus = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
      .take(1000);
    
    const installedSlugs = new Set(installedMenus.map(m => m.slug));
    
    // Return only features that aren't already installed
    return systemFeatures
      .filter(f => !installedSlugs.has(f.featureId))
      .map(f => ({
        featureId: f.featureId,
        slug: f.featureId,
        name: f.name,
        description: f.description,
        icon: f.icon,
        version: f.version,
        category: f.category,
        featureType: f.featureType,
        status: f.status,
        isReady: f.isReady,
        tags: f.tags,
        expectedRelease: f.expectedRelease,
        requiresPermission: f.requiresPermission,
      }));
  },
});

/**
 * Get single feature by ID
 */
export const getSystemFeature = query({
  args: {
    featureId: v.string(),
  },
  handler: async (ctx, args) => {
    const feature = await ctx.db
      .query("systemFeatures")
      .withIndex("by_feature_id", q => q.eq("featureId", args.featureId))
      .first();
    
    return feature;
  },
});

// ============================================================================
// MUTATIONS (Platform Admin Only)
// ============================================================================

/**
 * Create or update a system feature
 */
export const upsertSystemFeature = mutation({
  args: {
    featureId: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    version: v.string(),
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
    featureType: v.union(
      v.literal("default"),
      v.literal("optional"),
      v.literal("system"),
      v.literal("experimental")
    ),
    status: v.union(
      v.literal("stable"),
      v.literal("beta"),
      v.literal("development"),
      v.literal("experimental"),
      v.literal("deprecated"),
      v.literal("disabled")
    ),
    isEnabled: v.boolean(),
    isPublic: v.boolean(),
    isReady: v.boolean(),
    tags: v.optional(v.array(v.string())),
    requiresPermission: v.optional(v.string()),
    expectedRelease: v.optional(v.string()),
    releaseNotes: v.optional(v.string()),
    component: v.optional(v.string()),
    path: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    
    const identity = await ctx.auth.getUserIdentity();
    const user = identity ? await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first() : null;
    
    // Check if feature exists
    const existing = await ctx.db
      .query("systemFeatures")
      .withIndex("by_feature_id", q => q.eq("featureId", args.featureId))
      .first();
    
    const now = Date.now();
    
    if (existing) {
      // Log version change if version updated
      if (existing.version !== args.version) {
        await ctx.db.insert("featureVersionHistory", {
          featureId: args.featureId,
          version: args.version,
          previousVersion: existing.version,
          name: args.name,
          description: args.description,
          releaseNotes: args.releaseNotes,
          changedBy: user?._id,
          changedAt: now,
          changeType: "updated",
        });
      }
      
      // Update existing feature
      await ctx.db.patch(existing._id, {
        name: args.name,
        description: args.description,
        icon: args.icon,
        version: args.version,
        category: args.category,
        featureType: args.featureType,
        status: args.status,
        isEnabled: args.isEnabled,
        isPublic: args.isPublic,
        isReady: args.isReady,
        tags: args.tags,
        requiresPermission: args.requiresPermission,
        expectedRelease: args.expectedRelease,
        releaseNotes: args.releaseNotes,
        component: args.component,
        path: args.path,
        order: args.order ?? existing.order,
        updatedBy: user?._id,
        updatedAt: now,
      });
      
      return { action: "updated", featureId: args.featureId };
    }
    
    // Get next order number
    const allFeatures = await ctx.db.query("systemFeatures").take(100);
    const maxOrder = allFeatures.length > 0
      ? Math.max(...allFeatures.map(f => f.order))
      : 0;

    // Create new feature
    await ctx.db.insert("systemFeatures", {
      featureId: args.featureId,
      name: args.name,
      description: args.description,
      icon: args.icon,
      version: args.version,
      category: args.category,
      featureType: args.featureType,
      status: args.status,
      isEnabled: args.isEnabled,
      isPublic: args.isPublic,
      isReady: args.isReady,
      tags: args.tags,
      requiresPermission: args.requiresPermission,
      expectedRelease: args.expectedRelease,
      releaseNotes: args.releaseNotes,
      component: args.component,
      path: args.path,
      order: args.order ?? (maxOrder + 1),
      createdBy: user?._id,
      createdAt: now,
    });
    
    // Log creation
    await ctx.db.insert("featureVersionHistory", {
      featureId: args.featureId,
      version: args.version,
      name: args.name,
      description: args.description,
      releaseNotes: args.releaseNotes,
      changedBy: user?._id,
      changedAt: now,
      changeType: "created",
    });
    
    return { action: "created", featureId: args.featureId };
  },
});

/**
 * Update feature name (quick edit)
 */
export const updateFeatureName = mutation({
  args: {
    featureId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    
    const feature = await ctx.db
      .query("systemFeatures")
      .withIndex("by_feature_id", q => q.eq("featureId", args.featureId))
      .first();
    
    if (!feature) {
      throw new Error(`Feature '${args.featureId}' not found`);
    }
    
    const identity = await ctx.auth.getUserIdentity();
    const user = identity ? await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first() : null;
    
    await ctx.db.patch(feature._id, {
      name: args.name,
      updatedBy: user?._id,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Update feature version (with release notes)
 */
export const updateFeatureVersion = mutation({
  args: {
    featureId: v.string(),
    version: v.string(),
    releaseNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    
    const feature = await ctx.db
      .query("systemFeatures")
      .withIndex("by_feature_id", q => q.eq("featureId", args.featureId))
      .first();
    
    if (!feature) {
      throw new Error(`Feature '${args.featureId}' not found`);
    }
    
    const identity = await ctx.auth.getUserIdentity();
    const user = identity ? await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first() : null;
    
    const now = Date.now();
    
    // Log version change
    await ctx.db.insert("featureVersionHistory", {
      featureId: args.featureId,
      version: args.version,
      previousVersion: feature.version,
      name: feature.name,
      description: feature.description,
      releaseNotes: args.releaseNotes,
      changedBy: user?._id,
      changedAt: now,
      changeType: "updated",
    });
    
    await ctx.db.patch(feature._id, {
      version: args.version,
      releaseNotes: args.releaseNotes,
      updatedBy: user?._id,
      updatedAt: now,
    });
    
    return { success: true, previousVersion: feature.version };
  },
});

/**
 * Toggle feature enabled state
 */
export const toggleFeatureEnabled = mutation({
  args: {
    featureId: v.string(),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    
    const feature = await ctx.db
      .query("systemFeatures")
      .withIndex("by_feature_id", q => q.eq("featureId", args.featureId))
      .first();
    
    if (!feature) {
      throw new Error(`Feature '${args.featureId}' not found`);
    }
    
    const identity = await ctx.auth.getUserIdentity();
    const user = identity ? await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first() : null;
    
    const now = Date.now();
    
    // Log change
    await ctx.db.insert("featureVersionHistory", {
      featureId: args.featureId,
      version: feature.version,
      name: feature.name,
      description: feature.description,
      changedBy: user?._id,
      changedAt: now,
      changeType: args.isEnabled ? "enabled" : "disabled",
    });
    
    await ctx.db.patch(feature._id, {
      isEnabled: args.isEnabled,
      updatedBy: user?._id,
      updatedAt: now,
    });
    
    return { success: true };
  },
});

/**
 * Delete a system feature by featureId string
 */
export const deleteSystemFeatureByFeatureId = mutation({
  args: {
    featureId: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    
    const feature = await ctx.db
      .query("systemFeatures")
      .withIndex("by_feature_id", q => q.eq("featureId", args.featureId))
      .first();
    
    if (!feature) {
      throw new Error(`Feature '${args.featureId}' not found`);
    }
    
    // Delete version history for this feature
    const versionHistory = await ctx.db
      .query("featureVersionHistory")
      .withIndex("by_feature", q => q.eq("featureId", args.featureId))
      .take(1000);
    
    for (const entry of versionHistory) {
      await ctx.db.delete(entry._id);
    }
    
    // Delete feature
    await ctx.db.delete(feature._id);
    
    return { success: true };
  },
});

/**
 * Update feature order (for drag-drop reordering)
 */
export const updateFeatureOrder = mutation({
  args: {
    featureId: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    
    const feature = await ctx.db
      .query("systemFeatures")
      .withIndex("by_feature_id", q => q.eq("featureId", args.featureId))
      .first();
    
    if (!feature) {
      throw new Error(`Feature '${args.featureId}' not found`);
    }
    
    await ctx.db.patch(feature._id, {
      order: args.order,
      updatedAt: Date.now(),
    });
    
    return { success: true };
  },
});

/**
 * Seed system features from OPTIONAL_FEATURES_CATALOG
 * This creates initial records in systemFeatures table
 */
export const seedSystemFeatures = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("systemFeatures").first();
    if (existing) {
      return { action: "skipped", count: 0 };
    }
    
    const now = Date.now();
    let count = 0;
    
    // Seed from DEFAULT_MENU_ITEMS (default features)
    for (const item of DEFAULT_MENU_ITEMS) {
      const existing = await ctx.db
        .query("systemFeatures")
        .withIndex("by_feature_id", q => q.eq("featureId", item.slug))
        .first();
      
      if (!existing) {
        await ctx.db.insert("systemFeatures", {
          featureId: item.slug,
          name: item.name,
          description: (item.metadata as any)?.description || `${item.name} feature`,
          icon: item.icon || "Box",
          version: (item as any).version || "1.0.0",
          category: (item.metadata as any)?.category || "productivity",
          featureType: (item.metadata as any)?.featureType || "default",
          status: (item.metadata as any)?.status || "stable",
          isEnabled: true,
          isPublic: true,
          isReady: true,
          tags: (item.metadata as any)?.tags,
          requiresPermission: (item.metadata as any)?.requiresPermission,
          component: item.component,
          path: item.path,
          order: item.order || count,
          createdAt: now,
        });
        count++;
      }
    }
    
    // Seed from OPTIONAL_FEATURES_CATALOG
    for (const feature of OPTIONAL_FEATURES_CATALOG) {
      const existing = await ctx.db
        .query("systemFeatures")
        .withIndex("by_feature_id", q => q.eq("featureId", feature.slug))
        .first();
      
      if (!existing) {
        await ctx.db.insert("systemFeatures", {
          featureId: feature.slug,
          name: feature.name,
          description: feature.description,
          icon: feature.icon,
          version: feature.version,
          category: feature.category as any,
          featureType: (feature.featureType || "optional") as any,
          status: (feature.status || "stable") as any,
          isEnabled: true,
          isPublic: true,
          isReady: feature.isReady ?? true,
          tags: feature.tags,
          requiresPermission: feature.requiresPermission,
          order: 100 + count, // Put optional features after default
          createdAt: now,
        });
        count++;
      }
    }
    return { action: "seeded", count };
  },
});

/**
 * Get feature version history
 */
export const getFeatureVersionHistory = query({
  args: {
    featureId: v.string(),
  },
  handler: async (ctx, args) => {
    const isAdmin = await checkPlatformAdmin(ctx);
    if (!isAdmin) {
      throw new Error("Platform administrator access required");
    }
    
    const history = await ctx.db
      .query("featureVersionHistory")
      .withIndex("by_feature", q => q.eq("featureId", args.featureId))
      .order("desc")
      .take(1000);
    
    return history;
  },
});

// ============================================================================
// FRONTEND HOOK COMPATIBLE MUTATIONS
// ============================================================================

/**
 * Create a new system feature (frontend hook compatible)
 */
export const createSystemFeature = mutation({
  args: {
    featureId: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    version: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    status: v.string(),
    isReady: v.boolean(),
    expectedRelease: v.optional(v.string()),
    featureType: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    
    const identity = await ctx.auth.getUserIdentity();
    const user = identity ? await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first() : null;
    
    // Check if feature already exists
    const existing = await ctx.db
      .query("systemFeatures")
      .withIndex("by_feature_id", q => q.eq("featureId", args.featureId))
      .first();
    
    if (existing) {
      throw new Error(`Feature '${args.featureId}' already exists`);
    }

    // Get next order number
    const allFeatures = await ctx.db.query("systemFeatures").take(100);
    const maxOrder = allFeatures.length > 0 
      ? Math.max(...allFeatures.map(f => f.order)) 
      : 0;
    
    const now = Date.now();
    
    const featureId = await ctx.db.insert("systemFeatures", {
      featureId: args.featureId,
      name: args.name,
      description: args.description,
      icon: args.icon,
      version: args.version,
      category: args.category as any,
      featureType: args.featureType as any,
      status: args.status as any,
      isEnabled: true,
      isPublic: args.isPublic,
      isReady: args.isReady,
      tags: args.tags,
      expectedRelease: args.expectedRelease,
      order: maxOrder + 1,
      createdBy: user?._id,
      createdAt: now,
    });
    
    // Log creation
    await ctx.db.insert("featureVersionHistory", {
      featureId: args.featureId,
      version: args.version,
      name: args.name,
      description: args.description,
      changedBy: user?._id,
      changedAt: now,
      changeType: "created",
    });
    
    return { _id: featureId, featureId: args.featureId };
  },
});

/**
 * Update a system feature (frontend hook compatible)
 */
export const updateSystemFeature = mutation({
  args: {
    id: v.id("systemFeatures"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    version: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
    isReady: v.optional(v.boolean()),
    expectedRelease: v.optional(v.string()),
    featureType: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    isEnabled: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    
    const { id, ...updates } = args;
    
    const feature = await ctx.db.get(id);
    if (!feature) {
      throw new Error("Feature not found");
    }
    
    const identity = await ctx.auth.getUserIdentity();
    const user = identity ? await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first() : null;
    
    const now = Date.now();
    
    // Track version changes
    if (updates.version && updates.version !== feature.version) {
      await ctx.db.insert("featureVersionHistory", {
        featureId: feature.featureId,
        version: updates.version,
        previousVersion: feature.version,
        name: updates.name ?? feature.name,
        description: updates.description ?? feature.description,
        changedBy: user?._id,
        changedAt: now,
        changeType: "updated",
      });
    }
    
    // Build the patch object
    const patch: Record<string, any> = {
      updatedBy: user?._id,
      updatedAt: now,
    };
    
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.icon !== undefined) patch.icon = updates.icon;
    if (updates.version !== undefined) patch.version = updates.version;
    if (updates.category !== undefined) patch.category = updates.category;
    if (updates.tags !== undefined) patch.tags = updates.tags;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.isReady !== undefined) patch.isReady = updates.isReady;
    if (updates.expectedRelease !== undefined) patch.expectedRelease = updates.expectedRelease;
    if (updates.featureType !== undefined) patch.featureType = updates.featureType;
    if (updates.isPublic !== undefined) patch.isPublic = updates.isPublic;
    if (updates.isEnabled !== undefined) patch.isEnabled = updates.isEnabled;
    if (updates.order !== undefined) patch.order = updates.order;
    
    await ctx.db.patch(id, patch);
    
    return { success: true };
  },
});

/**
 * Delete system feature (frontend hook compatible)
 */
export const deleteSystemFeature = mutation({
  args: {
    id: v.id("systemFeatures"),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    
    const feature = await ctx.db.get(args.id);
    if (!feature) {
      throw new Error("Feature not found");
    }
    
    // Delete version history
    const history = await ctx.db
      .query("featureVersionHistory")
      .withIndex("by_feature", q => q.eq("featureId", feature.featureId))
      .take(1000);
    
    for (const entry of history) {
      await ctx.db.delete(entry._id);
    }
    
    // Delete feature
    await ctx.db.delete(args.id);
    
    return { success: true };
  },
});

/**
 * Set feature visibility (frontend hook compatible)
 */
export const setFeatureVisibility = mutation({
  args: {
    id: v.id("systemFeatures"),
    isPublic: v.boolean(),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    
    const feature = await ctx.db.get(args.id);
    if (!feature) {
      throw new Error("Feature not found");
    }
    
    const identity = await ctx.auth.getUserIdentity();
    const user = identity ? await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first() : null;
    
    const now = Date.now();
    
    // Log visibility change
    const changeType = !args.isEnabled ? "disabled" : (args.isEnabled ? "enabled" : "updated");
    await ctx.db.insert("featureVersionHistory", {
      featureId: feature.featureId,
      version: feature.version,
      name: feature.name,
      description: feature.description,
      changedBy: user?._id,
      changedAt: now,
      changeType,
    });
    
    await ctx.db.patch(args.id, {
      isPublic: args.isPublic,
      isEnabled: args.isEnabled,
      updatedBy: user?._id,
      updatedAt: now,
    });
    
    return { success: true };
  },
});

/**
 * Seed system features from catalog (frontend hook compatible)
 */
export const seedSystemFeaturesFromCatalog = mutation({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    
    const identity = await ctx.auth.getUserIdentity();
    const user = identity ? await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", identity.subject))
      .first() : null;
    
    const now = Date.now();
    let created = 0;
    let skipped = 0;
    
    // Combine DEFAULT_MENU_ITEMS and OPTIONAL_FEATURES_CATALOG
    const allFeatures: Array<{
      slug: string;
      name: string;
      description: string;
      icon: string;
      version: string;
      category: string;
      featureType: string;
      status: string;
      isReady: boolean;
      tags?: string[];
      requiresPermission?: string;
      expectedRelease?: string;
      component?: string;
      path?: string;
      order: number;
    }> = [];
    
    // Add from DEFAULT_MENU_ITEMS
    for (let i = 0; i < DEFAULT_MENU_ITEMS.length; i++) {
      const item = DEFAULT_MENU_ITEMS[i];
      allFeatures.push({
        slug: item.slug,
        name: item.name,
        description: (item.metadata as any)?.description || `${item.name} feature`,
        icon: item.icon || "Box",
        version: (item as any).version || "1.0.0",
        category: (item.metadata as any)?.category || "productivity",
        featureType: (item.metadata as any)?.featureType || "default",
        status: (item.metadata as any)?.status || "stable",
        isReady: true,
        tags: (item.metadata as any)?.tags,
        requiresPermission: (item.metadata as any)?.requiresPermission,
        component: item.component,
        path: item.path,
        order: i,
      });
    }
    
    // Add from OPTIONAL_FEATURES_CATALOG
    for (let i = 0; i < OPTIONAL_FEATURES_CATALOG.length; i++) {
      const feature = OPTIONAL_FEATURES_CATALOG[i];
      // Skip if already in allFeatures
      if (allFeatures.some(f => f.slug === feature.slug)) continue;
      
      allFeatures.push({
        slug: feature.slug,
        name: feature.name,
        description: feature.description,
        icon: feature.icon,
        version: feature.version,
        category: feature.category,
        featureType: feature.featureType || "optional",
        status: feature.status || "stable",
        isReady: feature.isReady ?? true,
        tags: feature.tags,
        requiresPermission: feature.requiresPermission,
        order: 100 + i,
      });
    }
    
    // Insert each feature
    for (const feature of allFeatures) {
      const existing = await ctx.db
        .query("systemFeatures")
        .withIndex("by_feature_id", q => q.eq("featureId", feature.slug))
        .first();
      
      if (existing) {
        skipped++;
        continue;
      }
      
      await ctx.db.insert("systemFeatures", {
        featureId: feature.slug,
        name: feature.name,
        description: feature.description,
        icon: feature.icon,
        version: feature.version,
        category: feature.category as any,
        featureType: feature.featureType as any,
        status: feature.status as any,
        isEnabled: true,
        isPublic: true,
        isReady: feature.isReady,
        tags: feature.tags,
        requiresPermission: feature.requiresPermission,
        expectedRelease: feature.expectedRelease,
        component: feature.component,
        path: feature.path,
        order: feature.order,
        createdBy: user?._id,
        createdAt: now,
      });
      
      created++;
    }
    
    return { created, skipped };
  },
});
