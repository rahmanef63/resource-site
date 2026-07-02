/**
 * Bundle Categories Mutations
 * 
 * CRUD operations for managing bundle categories and feature-bundle memberships.
 * Only accessible by platform admins.
 */

import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { readIdentityEmail, resolveAuthEmail } from "../../lib/authIdentity";
import { isPlatformAdmin } from "../../lib/platformAdmin";
import { logAuditEvent } from "../../shared/audit";
import { ensureUser } from "../../auth/helpers";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get all bundle categories
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    await ensureUser(ctx);
    return await ctx.db
      .query("bundleCategories")
      .withIndex("by_order")
      .take(500);
  },
});

/**
 * Get bundle category by ID
 */
export const getById = query({
  args: { bundleId: v.string() },
  handler: async (ctx, args) => {
    await ensureUser(ctx);
    return await ctx.db
      .query("bundleCategories")
      .withIndex("by_bundle_id", (q) => q.eq("bundleId", args.bundleId))
      .first();
  },
});

/**
 * Get enabled bundle categories
 */
export const listEnabled = query({
  args: {},
  handler: async (ctx) => {
    await ensureUser(ctx);
    return await ctx.db
      .query("bundleCategories")
      .withIndex("by_enabled", (q) => q.eq("isEnabled", true))
      .take(500);
  },
});

/**
 * Get public bundle categories (for onboarding, workspace creation)
 * This query is accessible to any authenticated user
 */
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    // Cap at 500 — bundles are an admin-managed list; real workspaces
    // are expected to have far fewer. Guard against accidental OOM on
    // pages that subscribe this unauthenticated.
    const bundles = await ctx.db
      .query("bundleCategories")
      .withIndex("by_enabled", (q) => q.eq("isEnabled", true))
      .take(500);

    return bundles
      .filter((b) => b.isPublic)
      .sort((a, b) => a.order - b.order);
  },
});

/**
 * Get a bundle with all its feature memberships (for onboarding)
 */
export const getBundleWithFeatures = query({
  args: { bundleId: v.string() },
  handler: async (ctx, args) => {
    const bundle = await ctx.db
      .query("bundleCategories")
      .withIndex("by_bundle_id", (q) => q.eq("bundleId", args.bundleId))
      .first();

    if (!bundle || !bundle.isEnabled) return null;

    // Get all feature memberships for this bundle
    const memberships = await ctx.db
      .query("featureBundleMemberships")
      .withIndex("by_bundle", (q) => q.eq("bundleId", args.bundleId))
      .take(1000);

    // Group features by role
    const features = {
      core: memberships.filter((m) => m.role === "core").map((m) => m.featureId),
      recommended: memberships.filter((m) => m.role === "recommended").map((m) => m.featureId),
      optional: memberships.filter((m) => m.role === "optional").map((m) => m.featureId),
    };

    return {
      ...bundle,
      features,
    };
  },
});

/**
 * Get feature-bundle memberships for a feature
 */
export const getFeatureBundles = query({
  args: { featureId: v.string() },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("featureBundleMemberships")
      .withIndex("by_feature", (q) => q.eq("featureId", args.featureId))
      .take(500);

    // Fetch bundle details for each membership
    const bundleIds = [...new Set(memberships.map((m) => m.bundleId))];
    const bundles = await Promise.all(
      bundleIds.map(async (bundleId) => {
        return await ctx.db
          .query("bundleCategories")
          .withIndex("by_bundle_id", (q) => q.eq("bundleId", bundleId))
          .first();
      })
    );

    const bundleMap = new Map(bundles.filter(Boolean).map((b) => [b!.bundleId, b]));

    return memberships.map((m) => ({
      ...m,
      bundle: bundleMap.get(m.bundleId),
    }));
  },
});

/**
 * Get all features in a bundle
 */
export const getBundleFeatures = query({
  args: { bundleId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("featureBundleMemberships")
      .withIndex("by_bundle", (q) => q.eq("bundleId", args.bundleId))
      .take(1000);
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a new bundle category
 */
export const create = mutation({
  args: {
    bundleId: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.union(
      v.literal("productivity"),
      v.literal("business"),
      v.literal("personal"),
      v.literal("creative"),
      v.literal("education"),
      v.literal("community")
    ),
    primaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    recommendedFor: v.array(v.union(
      v.literal("personal"),
      v.literal("family"),
      v.literal("group"),
      v.literal("organization"),
      v.literal("institution")
    )),
    tags: v.array(v.string()),
    isEnabled: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = (await resolveAuthEmail(ctx)) ?? "";
    if (!isPlatformAdmin(email)) {
      throw new Error("Only platform admins can create bundle categories");
    }

    const userId = await ensureUser(ctx);

    // Check for duplicate bundleId
    const existing = await ctx.db
      .query("bundleCategories")
      .withIndex("by_bundle_id", (q) => q.eq("bundleId", args.bundleId))
      .first();

    if (existing) {
      throw new Error(`Bundle category "${args.bundleId}" already exists`);
    }

    // Get the highest order number — use by_order index + descending take(1)
    // instead of full-table collect (DoS vector on a write path).
    const topOrdered = await ctx.db
      .query("bundleCategories")
      .withIndex("by_order")
      .order("desc")
      .take(1);
    const maxOrder = topOrdered[0]?.order ?? -1;

    const id = await ctx.db.insert("bundleCategories", {
      bundleId: args.bundleId,
      name: args.name,
      description: args.description,
      icon: args.icon,
      category: args.category,
      primaryColor: args.primaryColor,
      accentColor: args.accentColor,
      recommendedFor: args.recommendedFor,
      tags: args.tags,
      isEnabled: args.isEnabled ?? true,
      isPublic: args.isPublic ?? true,
      order: maxOrder + 1,
      isSystem: false,
      createdAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      workspaceId: "system",
      actorUserId: userId ?? undefined,
      actor: email,
      action: "bundle.create",
      resourceType: "bundleCategory",
      resourceId: id,
      metadata: { bundleId: args.bundleId, name: args.name },
    });

    return id;
  },
});

/**
 * Update a bundle category
 */
export const update = mutation({
  args: {
    id: v.id("bundleCategories"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    category: v.optional(v.union(
      v.literal("productivity"),
      v.literal("business"),
      v.literal("personal"),
      v.literal("creative"),
      v.literal("education"),
      v.literal("community")
    )),
    primaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    recommendedFor: v.optional(v.array(v.union(
      v.literal("personal"),
      v.literal("family"),
      v.literal("group"),
      v.literal("organization"),
      v.literal("institution")
    ))),
    tags: v.optional(v.array(v.string())),
    isEnabled: v.optional(v.boolean()),
    isPublic: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = (await resolveAuthEmail(ctx)) ?? "";
    if (!isPlatformAdmin(email)) {
      throw new Error("Only platform admins can update bundle categories");
    }

    const userId = await ensureUser(ctx);

    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    await ctx.db.patch(id, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      workspaceId: "system",
      actorUserId: userId ?? undefined,
      actor: email,
      action: "bundle.update",
      resourceType: "bundleCategory",
      resourceId: id,
      changes: filteredUpdates,
    });
  },
});

/**
 * Delete a bundle category
 */
export const remove = mutation({
  args: { id: v.id("bundleCategories") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = (await resolveAuthEmail(ctx)) ?? "";
    if (!isPlatformAdmin(email)) {
      throw new Error("Only platform admins can delete bundle categories");
    }

    const userId = await ensureUser(ctx);

    const bundle = await ctx.db.get(args.id);
    if (!bundle) throw new Error("Bundle category not found");

    if (bundle.isSystem) {
      throw new Error("Cannot delete system bundle categories");
    }

    // Delete all memberships for this bundle
    const memberships = await ctx.db
      .query("featureBundleMemberships")
      .withIndex("by_bundle", (q) => q.eq("bundleId", bundle.bundleId))
      .take(1000);

    for (const membership of memberships) {
      await ctx.db.delete(membership._id);
    }

    await ctx.db.delete(args.id);

    await logAuditEvent(ctx, {
      workspaceId: "system",
      actorUserId: userId ?? undefined,
      actor: email,
      action: "bundle.delete",
      resourceType: "bundleCategory",
      resourceId: args.id,
      metadata: { bundleId: bundle.bundleId, name: bundle.name },
    });
  },
});

/**
 * Set feature-bundle membership
 */
export const setFeatureBundleMembership = mutation({
  args: {
    featureId: v.string(),
    bundleId: v.string(),
    role: v.union(
      v.literal("core"),
      v.literal("recommended"),
      v.literal("optional")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = (await resolveAuthEmail(ctx)) ?? "";
    if (!isPlatformAdmin(email)) {
      throw new Error("Only platform admins can set feature bundle memberships");
    }

    const userId = await ensureUser(ctx);

    // Check if membership already exists
    const existing = await ctx.db
      .query("featureBundleMemberships")
      .withIndex("by_feature_bundle", (q) =>
        q.eq("featureId", args.featureId).eq("bundleId", args.bundleId)
      )
      .first();

    let resultId;

    if (existing) {
      // Update the role
      await ctx.db.patch(existing._id, {
        role: args.role,
        updatedAt: Date.now(),
      });
      resultId = existing._id;
    } else {
      // Create new membership
      resultId = await ctx.db.insert("featureBundleMemberships", {
        featureId: args.featureId,
        bundleId: args.bundleId,
        role: args.role,
        createdAt: Date.now(),
      });
    }

    await logAuditEvent(ctx, {
      workspaceId: "system",
      actorUserId: userId ?? undefined,
      actor: email,
      action: "bundle.set_feature",
      resourceType: "featureBundleMembership",
      resourceId: resultId,
      metadata: { featureId: args.featureId, bundleId: args.bundleId, role: args.role },
    });

    return resultId;
  },
});

/**
 * Remove feature from bundle
 */
export const removeFeatureFromBundle = mutation({
  args: {
    featureId: v.string(),
    bundleId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = (await resolveAuthEmail(ctx)) ?? "";
    if (!isPlatformAdmin(email)) {
      throw new Error("Only platform admins can remove feature bundle memberships");
    }

    const userId = await ensureUser(ctx);

    const membership = await ctx.db
      .query("featureBundleMemberships")
      .withIndex("by_feature_bundle", (q) =>
        q.eq("featureId", args.featureId).eq("bundleId", args.bundleId)
      )
      .first();

    if (membership) {
      await ctx.db.delete(membership._id);

      await logAuditEvent(ctx, {
        workspaceId: "system",
        actorUserId: userId ?? undefined,
        actor: email,
        action: "bundle.remove_feature",
        resourceType: "featureBundleMembership",
        resourceId: membership._id,
        metadata: { featureId: args.featureId, bundleId: args.bundleId },
      });
    }
  },
});

/**
 * Bulk set feature bundle memberships
 * Used when editing multiple bundles for a single feature
 */
export const setFeatureBundles = mutation({
  args: {
    featureId: v.string(),
    bundles: v.array(v.object({
      bundleId: v.string(),
      role: v.union(
        v.literal("core"),
        v.literal("recommended"),
        v.literal("optional")
      ),
    })),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = (await resolveAuthEmail(ctx)) ?? "";
    if (!isPlatformAdmin(email)) {
      throw new Error("Only platform admins can set feature bundle memberships");
    }

    const userId = await ensureUser(ctx);

    // Get existing memberships for this feature
    const existingMemberships = await ctx.db
      .query("featureBundleMemberships")
      .withIndex("by_feature", (q) => q.eq("featureId", args.featureId))
      .take(500);

    const existingMap = new Map(existingMemberships.map((m) => [m.bundleId, m]));
    const newBundleIds = new Set(args.bundles.map((b) => b.bundleId));

    // Remove memberships that are no longer in the list
    for (const existing of existingMemberships) {
      if (!newBundleIds.has(existing.bundleId)) {
        await ctx.db.delete(existing._id);
      }
    }

    // Add or update memberships
    for (const bundle of args.bundles) {
      const existing = existingMap.get(bundle.bundleId);

      if (existing) {
        if (existing.role !== bundle.role) {
          await ctx.db.patch(existing._id, {
            role: bundle.role,
            updatedAt: Date.now(),
          });
        }
      } else {
        await ctx.db.insert("featureBundleMemberships", {
          featureId: args.featureId,
          bundleId: bundle.bundleId,
          role: bundle.role,
          createdAt: Date.now(),
        });
      }
    }

    await logAuditEvent(ctx, {
      workspaceId: "system",
      actorUserId: userId ?? undefined,
      actor: email,
      action: "bundle.bulk_set_features",
      resourceType: "feature",
      resourceId: args.featureId,
      metadata: { bundleCount: args.bundles.length },
    });
  },
});

/**
 * Seed bundle categories from static BUNDLE_METADATA
 * Used to initialize the database with existing bundle definitions
 */
export const seedBundleCategories = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const email = (await resolveAuthEmail(ctx)) ?? "";
    if (!isPlatformAdmin(email)) {
      throw new Error("Only platform admins can seed bundle categories");
    }

    const userId = await ensureUser(ctx);

    // Static bundle metadata from BUNDLE_METADATA
    type WorkspaceType = "personal" | "family" | "group" | "organization" | "institution";
    type BundleCategory = "productivity" | "business" | "personal" | "creative" | "education" | "community";

    const BUNDLE_METADATA: Array<{
      bundleId: string;
      name: string;
      description: string;
      icon: string;
      category: BundleCategory;
      recommendedFor: WorkspaceType[];
      primaryColor?: string;
      tags: string[];
    }> = [
        {
          bundleId: "startup",
          name: "Startup",
          description: "Everything you need to build and grow your startup",
          icon: "Rocket",
          category: "business",
          recommendedFor: ["organization", "group"],
          primaryColor: "#6366f1",
          tags: ["startup", "team", "agile", "collaboration"],
        },
        {
          bundleId: "business-pro",
          name: "Business Pro",
          description: "Complete business management suite for organizations",
          icon: "Building2",
          category: "business",
          recommendedFor: ["organization", "institution"],
          primaryColor: "#0891b2",
          tags: ["business", "enterprise", "management", "crm"],
        },
        {
          bundleId: "sales-crm",
          name: "Sales & CRM",
          description: "Customer relationship management and sales pipeline",
          icon: "TrendingUp",
          category: "business",
          recommendedFor: ["organization", "group"],
          primaryColor: "#059669",
          tags: ["sales", "crm", "pipeline", "leads"],
        },
        {
          bundleId: "project-management",
          name: "Project Management",
          description: "Organize and track projects with your team",
          icon: "Kanban",
          category: "productivity",
          recommendedFor: ["organization", "group", "institution"],
          primaryColor: "#8b5cf6",
          tags: ["projects", "tasks", "kanban", "agile"],
        },
        {
          bundleId: "knowledge-base",
          name: "Knowledge Base",
          description: "Document and share knowledge with your team",
          icon: "BookOpen",
          category: "productivity",
          recommendedFor: ["organization", "institution", "group"],
          primaryColor: "#f59e0b",
          tags: ["wiki", "docs", "knowledge", "documentation"],
        },
        {
          bundleId: "personal-minimal",
          name: "Personal Minimal",
          description: "Clean and simple workspace for personal use",
          icon: "User",
          category: "personal",
          recommendedFor: ["personal"],
          primaryColor: "#64748b",
          tags: ["personal", "minimal", "simple"],
        },
        {
          bundleId: "personal-productivity",
          name: "Personal Productivity",
          description: "Full-featured personal productivity workspace",
          icon: "Target",
          category: "personal",
          recommendedFor: ["personal"],
          primaryColor: "#ec4899",
          tags: ["personal", "productivity", "gtd"],
        },
        {
          bundleId: "family",
          name: "Family Hub",
          description: "Organize and connect with your family",
          icon: "Heart",
          category: "personal",
          recommendedFor: ["family"],
          primaryColor: "#f43f5e",
          tags: ["family", "home", "shared"],
        },
        {
          bundleId: "content-creator",
          name: "Content Creator",
          description: "Create and manage content with CMS and builder tools",
          icon: "Palette",
          category: "creative",
          recommendedFor: ["personal", "organization", "group"],
          primaryColor: "#a855f7",
          tags: ["content", "cms", "blog", "creative"],
        },
        {
          bundleId: "digital-agency",
          name: "Digital Agency",
          description: "Manage clients, projects, and creative work",
          icon: "Zap",
          category: "creative",
          recommendedFor: ["organization", "group"],
          primaryColor: "#06b6d4",
          tags: ["agency", "clients", "creative", "projects"],
        },
        {
          bundleId: "education",
          name: "Education",
          description: "Learning management for schools and institutions",
          icon: "GraduationCap",
          category: "education",
          recommendedFor: ["institution", "organization"],
          primaryColor: "#0ea5e9",
          tags: ["education", "learning", "school", "students"],
        },
        {
          bundleId: "community",
          name: "Community",
          description: "Build and engage with your community",
          icon: "Users",
          category: "community",
          recommendedFor: ["group", "organization"],
          primaryColor: "#22c55e",
          tags: ["community", "social", "members", "engagement"],
        },
        {
          bundleId: "custom",
          name: "Custom",
          description: "Start from scratch and choose your own features",
          icon: "Settings2",
          category: "productivity",
          recommendedFor: ["personal", "family", "group", "organization", "institution"],
          tags: ["custom", "flexible"],
        },
      ];

    let created = 0;
    let skipped = 0;

    for (let i = 0; i < BUNDLE_METADATA.length; i++) {
      const bundle = BUNDLE_METADATA[i];

      // Check if already exists
      const existing = await ctx.db
        .query("bundleCategories")
        .withIndex("by_bundle_id", (q) => q.eq("bundleId", bundle.bundleId))
        .first();

      if (existing) {
        skipped++;
        continue;
      }

      await ctx.db.insert("bundleCategories", {
        bundleId: bundle.bundleId,
        name: bundle.name,
        description: bundle.description,
        icon: bundle.icon,
        category: bundle.category,
        primaryColor: bundle.primaryColor,
        recommendedFor: bundle.recommendedFor,
        tags: bundle.tags,
        isEnabled: true,
        isPublic: true,
        order: i,
        isSystem: true,
        createdAt: Date.now(),
      });
      created++;
    }

    await logAuditEvent(ctx, {
      workspaceId: "system",
      actorUserId: userId ?? undefined,
      actor: email,
      action: "bundle.seed",
      resourceType: "system",
      metadata: { created, skipped },
    });

    return { created, skipped };
  },
});
