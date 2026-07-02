/**
 * Saved Views API (Feature #69, #70)
 * User-specific saved view configurations and sharing
 */
import { query, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMISSIONS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";

// ============ SAVED VIEWS ============

/**
 * List saved views for current user
 */
export const listSavedViews = query({
  args: {
    workspaceId: v.id("workspaces"),
    viewId: v.optional(v.id("dbViews")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let query = ctx.db
      .query("dbSavedViews")
      .withIndex("by_workspace_user", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("userId", userId)
      );

    const savedViews = await query.take(1000);

    // Filter by viewId if provided
    if (args.viewId) {
      return savedViews.filter((sv) => sv.viewId === args.viewId);
    }

    return savedViews;
  },
});

/**
 * Get a single saved view by ID
 */
export const getSavedView = query({
  args: {
    savedViewId: v.id("dbSavedViews"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const savedView = await ctx.db.get(args.savedViewId);
    if (!savedView) return null;

    // Check if user owns this saved view or has access via sharing
    if (savedView.userId === userId) {
      return savedView;
    }

    // Check for shared access
    const sharedView = await ctx.db
      .query("dbSharedViews")
      .withIndex("by_saved_view", (q) => q.eq("savedViewId", args.savedViewId))
      .first();

    if (sharedView) {
      if (sharedView.shareType === "workspace") {
        return savedView;
      }
      if (
        sharedView.shareType === "users" &&
        sharedView.sharedWithUserIds?.includes(userId)
      ) {
        return savedView;
      }
    }

    return null;
  },
});

/**
 * Create a saved view
 */
export const createSavedView = mutation({
  args: {
    viewId: v.id("dbViews"),
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    settings: v.object({
      filters: v.array(
        v.object({
          fieldId: v.string(),
          operator: v.string(),
          value: v.optional(v.any()),
        })
      ),
      sorts: v.array(
        v.object({
          fieldId: v.string(),
          direction: v.union(v.literal("asc"), v.literal("desc")),
        })
      ),
      visibleFields: v.array(v.string()),
      groupBy: v.optional(v.string()),
      fieldWidths: v.optional(v.record(v.string(), v.number())),
    }),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    await requirePermission(ctx, args.workspaceId, PERMISSIONS.DATABASE_READ);

    const now = Date.now();

    // If setting as default, unset other defaults
    if (args.isDefault) {
      const existingDefaults = await ctx.db
        .query("dbSavedViews")
        .withIndex("by_workspace_user", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("userId", userId)
        )
        .filter((q) => q.eq(q.field("isDefault"), true))
        .take(1000);

      for (const existing of existingDefaults) {
        await ctx.db.patch(existing._id, { isDefault: false });
      }
    }

    const savedViewId = await ctx.db.insert("dbSavedViews", {
      viewId: args.viewId,
      userId,
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      settings: args.settings,
      isDefault: args.isDefault ?? false,
      createdAt: now,
      updatedAt: now,
    });

    await logAuditEvent(ctx, {
      action: "savedView.create",
      resourceType: "dbSavedViews",
      resourceId: savedViewId,
      workspaceId: args.workspaceId,
      userId,
      metadata: { name: args.name },
    });

    return savedViewId;
  },
});

/**
 * Update a saved view
 */
export const updateSavedView = mutation({
  args: {
    savedViewId: v.id("dbSavedViews"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    settings: v.optional(
      v.object({
        filters: v.array(
          v.object({
            fieldId: v.string(),
            operator: v.string(),
            value: v.optional(v.any()),
          })
        ),
        sorts: v.array(
          v.object({
            fieldId: v.string(),
            direction: v.union(v.literal("asc"), v.literal("desc")),
          })
        ),
        visibleFields: v.array(v.string()),
        groupBy: v.optional(v.string()),
        fieldWidths: v.optional(v.record(v.string(), v.number())),
      })
    ),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const savedView = await ctx.db.get(args.savedViewId);
    if (!savedView) throw new Error("Saved view not found");
    if (savedView.userId !== userId) throw new Error("Not authorized");

    await requirePermission(
      ctx,
      savedView.workspaceId,
      PERMISSIONS.DATABASE_READ
    );

    // If setting as default, unset other defaults
    if (args.isDefault) {
      const existingDefaults = await ctx.db
        .query("dbSavedViews")
        .withIndex("by_workspace_user", (q) =>
          q
            .eq("workspaceId", savedView.workspaceId)
            .eq("userId", userId)
        )
        .filter((q) => q.eq(q.field("isDefault"), true))
        .take(100);

      for (const existing of existingDefaults) {
        if (existing._id !== args.savedViewId) {
          await ctx.db.patch(existing._id, { isDefault: false });
        }
      }
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.settings !== undefined) updates.settings = args.settings;
    if (args.isDefault !== undefined) updates.isDefault = args.isDefault;

    await ctx.db.patch(args.savedViewId, updates);

    await logAuditEvent(ctx, {
      action: "savedView.update",
      resourceType: "dbSavedViews",
      resourceId: args.savedViewId,
      workspaceId: savedView.workspaceId,
      userId,
      metadata: { name: args.name ?? savedView.name },
    });

    return args.savedViewId;
  },
});

/**
 * Delete a saved view
 */
export const deleteSavedView = mutation({
  args: {
    savedViewId: v.id("dbSavedViews"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const savedView = await ctx.db.get(args.savedViewId);
    if (!savedView) throw new Error("Saved view not found");
    if (savedView.userId !== userId) throw new Error("Not authorized");

    // Delete any shares first
    const shares = await ctx.db
      .query("dbSharedViews")
      .withIndex("by_saved_view", (q) => q.eq("savedViewId", args.savedViewId))
      .take(1000);

    for (const share of shares) {
      await ctx.db.delete(share._id);
    }

    await ctx.db.delete(args.savedViewId);

    await logAuditEvent(ctx, {
      action: "savedView.delete",
      resourceType: "dbSavedViews",
      resourceId: args.savedViewId,
      workspaceId: savedView.workspaceId,
      userId,
      metadata: { name: savedView.name },
    });

    return true;
  },
});

// ============ SHARED VIEWS ============

/**
 * Share a saved view
 */
export const shareView = mutation({
  args: {
    savedViewId: v.id("dbSavedViews"),
    shareType: v.union(
      v.literal("workspace"),
      v.literal("users"),
      v.literal("link")
    ),
    sharedWithUserIds: v.optional(v.array(v.id("users"))),
    permission: v.union(v.literal("view"), v.literal("edit")),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const savedView = await ctx.db.get(args.savedViewId);
    if (!savedView) throw new Error("Saved view not found");
    if (savedView.userId !== userId) throw new Error("Not authorized");

    await requirePermission(
      ctx,
      savedView.workspaceId,
      PERMISSIONS.DATABASE_UPDATE
    );

    // Generate access token for link shares
    let accessToken: string | undefined;
    if (args.shareType === "link") {
      accessToken = crypto.randomUUID();
    }

    const shareId = await ctx.db.insert("dbSharedViews", {
      savedViewId: args.savedViewId,
      workspaceId: savedView.workspaceId,
      sharedById: userId,
      shareType: args.shareType,
      sharedWithUserIds: args.sharedWithUserIds,
      accessToken,
      permission: args.permission,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });

    await logAuditEvent(ctx, {
      action: "sharedView.create",
      resourceType: "dbSharedViews",
      resourceId: shareId,
      workspaceId: savedView.workspaceId,
      userId,
      metadata: { shareType: args.shareType, permission: args.permission },
    });

    return { shareId, accessToken };
  },
});

/**
 * Get shared view by access token (for link shares)
 */
export const getSharedViewByToken = query({
  args: {
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const sharedView = await ctx.db
      .query("dbSharedViews")
      .withIndex("by_access_token", (q) => q.eq("accessToken", args.accessToken))
      .first();

    if (!sharedView) return null;

    // Check expiration
    if (sharedView.expiresAt && sharedView.expiresAt < Date.now()) {
      return null;
    }

    const savedView = await ctx.db.get(sharedView.savedViewId);
    if (!savedView) return null;

    return {
      savedView,
      permission: sharedView.permission,
    };
  },
});

/**
 * Revoke a shared view
 */
export const revokeShare = mutation({
  args: {
    shareId: v.id("dbSharedViews"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const share = await ctx.db.get(args.shareId);
    if (!share) throw new Error("Share not found");
    if (share.sharedById !== userId) throw new Error("Not authorized");

    await ctx.db.delete(args.shareId);

    await logAuditEvent(ctx, {
      action: "sharedView.revoke",
      resourceType: "dbSharedViews",
      resourceId: args.shareId,
      workspaceId: share.workspaceId,
      userId,
      metadata: {},
    });

    return true;
  },
});

/**
 * List shares for a saved view
 */
export const listShares = query({
  args: {
    savedViewId: v.id("dbSavedViews"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const savedView = await ctx.db.get(args.savedViewId);
    if (!savedView) return [];
    if (savedView.userId !== userId) return [];

    return ctx.db
      .query("dbSharedViews")
      .withIndex("by_saved_view", (q) => q.eq("savedViewId", args.savedViewId))
      .take(1000);
  },
});
