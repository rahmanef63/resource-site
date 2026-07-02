import { mutation } from "../../_generated";
import { v } from "convex/values";
import { Doc, Id } from "../../_generated";
import { requireAdminForWorkspace } from "../../../lib/rbac";
import { logAuditEvent } from "../../../lib/audit";

/**
 * Create or update a feature
 */
export const upsertFeature = mutation({
  args: {
    workspaceId: v.string(),
    key: v.string(),
    status: v.string(),
    type: v.string(),
    displayOrder: v.optional(v.number()),
    translations: v.record(v.string(), v.object({
      title: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
    })),
    settings: v.optional(v.record(v.string(), v.any())),
    requiredRoles: v.optional(v.array(v.string())),
    dependencies: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({
      version: v.optional(v.string()),
      lastTestedAt: v.optional(v.number()),
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const existing = await ctx.db
      .query("features")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("key", args.key))
      .unique();

    const now = Date.now();
    let id: Id<"features">;
    let action = "features.update";

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        type: args.type,
        displayOrder: args.displayOrder ?? existing.displayOrder,
        translations: args.translations,
        settings: args.settings,
        requiredRoles: args.requiredRoles,
        dependencies: args.dependencies,
        metadata: args.metadata,
        updatedAt: now,
        updatedBy: args.updatedBy || actor.clerkUserId,
      });
      id = existing._id;
    } else {
      // Find highest display order if not provided
      let displayOrder = args.displayOrder;
      if (displayOrder === undefined) {
        const lastFeature = await ctx.db
          .query("features")
          .withIndex("by_display_order", (q) =>
            q.eq("workspaceId", args.workspaceId)
          )
          .order("desc")
          .first();
        displayOrder = (lastFeature?.displayOrder || 0) + 1;
      }

      id = await ctx.db.insert("features", {
        workspaceId: args.workspaceId,
        key: args.key,
        status: args.status,
        type: args.type,
        displayOrder,
        translations: args.translations,
        settings: args.settings,
        requiredRoles: args.requiredRoles,
        dependencies: args.dependencies,
        metadata: args.metadata,
        createdAt: now,
        createdBy: args.updatedBy || actor.clerkUserId,
        updatedAt: now,
        updatedBy: args.updatedBy || actor.clerkUserId,
      });
      action = "features.create";
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "feature",
      resourceId: id,
      action,
      changes: { key: args.key, status: args.status },
    });

    return id;
  },
});

/**
 * Create or update a feature group
 */
export const upsertGroup = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
    status: v.string(),
    displayOrder: v.optional(v.number()),
    translations: v.record(v.string(), v.object({
      title: v.string(),
      description: v.optional(v.string()),
      icon: v.optional(v.string()),
    })),
    features: v.array(v.string()),
    metadata: v.optional(v.object({
      category: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const existing = await ctx.db
      .query("featureGroups")
      .withIndex("by_workspace_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .unique();

    const now = Date.now();
    let id: Id<"featureGroups">;
    let action = "features.group.update";

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        displayOrder: args.displayOrder ?? existing.displayOrder,
        translations: args.translations,
        features: args.features,
        metadata: args.metadata,
        updatedAt: now,
      });
      id = existing._id;
    } else {
      // Find highest display order if not provided
      let displayOrder = args.displayOrder;
      if (displayOrder === undefined) {
        const lastGroup = await ctx.db
          .query("featureGroups")
          .withIndex("by_display_order", (q) =>
            q.eq("workspaceId", args.workspaceId)
          )
          .order("desc")
          .first();
        displayOrder = (lastGroup?.displayOrder || 0) + 1;
      }

      id = await ctx.db.insert("featureGroups", {
        workspaceId: args.workspaceId,
        name: args.name,
        status: args.status,
        displayOrder,
        translations: args.translations,
        features: args.features,
        metadata: args.metadata,
        createdAt: now,
        updatedAt: now,
      });
      action = "features.group.create";
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "featureGroup",
      resourceId: id,
      action,
      changes: { name: args.name, status: args.status },
    });

    return id;
  },
});

/**
 * Flat-shape wrapper around `upsertFeature` for admin UIs that expose a
 * per-locale title/description/icon form (rather than the full
 * `translations` record). Reads the existing doc so other locales are
 * preserved, then delegates to `upsertFeature`.
 */
export const upsertFeatureFlat = mutation({
  args: {
    workspaceId: v.string(),
    key: v.string(),
    locale: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    status: v.optional(v.string()),
    type: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const existing = await ctx.db
      .query("features")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("key", args.key))
      .unique();

    const translations = { ...(existing?.translations ?? {}) };
    translations[args.locale] = {
      title: args.title,
      description: args.description,
      icon: args.icon,
    };

    const now = Date.now();
    let id: Id<"features">;
    let action = "features.update";

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status ?? existing.status,
        type: args.type ?? existing.type,
        displayOrder: args.displayOrder ?? existing.displayOrder,
        translations,
        updatedAt: now,
        updatedBy: actor.clerkUserId,
      });
      id = existing._id;
    } else {
      let displayOrder = args.displayOrder;
      if (displayOrder === undefined) {
        const lastFeature = await ctx.db
          .query("features")
          .withIndex("by_display_order", (q) =>
            q.eq("workspaceId", args.workspaceId)
          )
          .order("desc")
          .first();
        displayOrder = (lastFeature?.displayOrder || 0) + 1;
      }

      id = await ctx.db.insert("features", {
        workspaceId: args.workspaceId,
        key: args.key,
        status: args.status ?? "active",
        type: args.type ?? "content",
        displayOrder,
        translations,
        createdAt: now,
        createdBy: actor.clerkUserId,
        updatedAt: now,
        updatedBy: actor.clerkUserId,
      });
      action = "features.create";
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "feature",
      resourceId: id,
      action,
      changes: { key: args.key, locale: args.locale },
    });

    return id;
  },
});

/**
 * Delete a feature
 */
export const deleteFeature = mutation({
  args: {
    workspaceId: v.string(),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const feature = await ctx.db
      .query("features")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq("key", args.key))
      .unique();

    if (!feature) {
      throw new Error("Feature not found");
    }

    // Remove from any groups
    const groups = await ctx.db
      .query("featureGroups")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000);

    for (const group of groups) {
      if (group.features.includes(args.key)) {
        await ctx.db.patch(group._id, {
          features: group.features.filter(f => f !== args.key),
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.db.delete(feature._id);

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "feature",
      resourceId: feature._id,
      action: "features.delete",
      changes: { key: args.key },
    });

    return true;
  },
});

/**
 * Delete a feature group
 */
export const deleteGroup = mutation({
  args: {
    workspaceId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const actor = await requireAdminForWorkspace(ctx, args.workspaceId);

    const group = await ctx.db
      .query("featureGroups")
      .withIndex("by_workspace_name", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .unique();

    if (!group) {
      throw new Error("Group not found");
    }

    await ctx.db.delete(group._id);

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: actor.clerkUserId,
      resourceType: "featureGroup",
      resourceId: group._id,
      action: "features.group.delete",
      changes: { name: args.name },
    });

    return true;
  },
});

