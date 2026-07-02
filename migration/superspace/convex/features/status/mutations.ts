import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { getExistingUserId, requirePermission } from "../../auth/helpers";
import { PERMS } from "../../workspace/permissions"
import type { Id } from "../../_generated/dataModel";
import { logAuditEvent } from "../../shared/audit";


/**
 * Create a new status
 */
export const createStatus = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.union(v.literal("text"), v.literal("image"), v.literal("video")),
    content: v.string(),
    storageId: v.optional(v.id("_storage")),
    backgroundColor: v.optional(v.string()),
    textColor: v.optional(v.string()),
    font: v.optional(v.string()),
    caption: v.optional(v.string()),
    duration: v.optional(v.number()),
  },
  returns: v.id("statuses"),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.STATUS_MANAGE);
    const userId = await getExistingUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours from now

    const statusId = await ctx.db.insert("statuses", {
      userId,
      workspaceId: args.workspaceId,
      type: args.type,
      content: args.content,
      storageId: args.storageId,
      backgroundColor: args.backgroundColor,
      textColor: args.textColor,
      font: args.font,
      viewCount: 0,
      createdAt: now,
      expiresAt,
      metadata: {
        caption: args.caption,
        duration: args.duration,
      },
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "status.create",
      resourceType: "status",
      resourceId: statusId,
      metadata: { type: args.type },
    });

    return statusId;
  },
});

/**
 * View a status (records that current user viewed it)
 */
export const viewStatus = mutation({
  args: {
    statusId: v.id("statuses"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const status = await ctx.db.get(args.statusId);
    if (!status) throw new Error("Status not found");
    await requirePermission(ctx, status.workspaceId, PERMS.STATUS_MANAGE);
    const userId = await getExistingUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already viewed
    const existingView = await (ctx.db
      .query("statusViews")
      .withIndex("by_status_viewer", (q: any) =>
        q.eq("statusId", args.statusId)
      )
      .filter((q) => q.eq(q.field("viewerId"), userId))
      .first());

    if (!existingView) {
      await ctx.db.insert("statusViews", {
        statusId: args.statusId,
        viewerId: userId,
        viewedAt: Date.now(),
      });

      // Increment view count
      await ctx.db.patch(args.statusId, {
        viewCount: status.viewCount + 1,
      });
    }

    await logAuditEvent(ctx, {
      workspaceId: status.workspaceId,
      actorUserId: userId,
      action: "status.view",
      resourceType: "status",
      resourceId: args.statusId,
    });

    return null;
  },
});

/**
 * Delete a status
 */
export const deleteStatus = mutation({
  args: {
    statusId: v.id("statuses"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const status = await ctx.db.get(args.statusId);
    if (!status) throw new Error("Status not found");
    await requirePermission(ctx, status.workspaceId, PERMS.STATUS_MANAGE);
    const userId = await getExistingUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Delete all views first
    const views = await (ctx.db
      .query("statusViews")
      .withIndex("by_status", (q: any) => q.eq("statusId", args.statusId))
      .take(500));

    for (const view of views) {
      await ctx.db.delete(view._id);
    }

    // Delete the status
    await ctx.db.delete(args.statusId);

    await logAuditEvent(ctx, {
      workspaceId: status.workspaceId,
      actorUserId: userId,
      action: "status.delete",
      resourceType: "status",
      resourceId: args.statusId,
      metadata: { deletedViews: views.length },
    });

    return null;
  },
});


/**
 * Seed sample status data for development/testing
 * Creates placeholder statuses that can be connected to builder later
 */
export const seedSampleStatuses = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(v.id("statuses")),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.STATUS_MANAGE);
    const userId = await getExistingUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const statusIds: Id<"statuses">[] = [];

    // Sample status data - placeholders for development
    const sampleStatuses = [
      {
        type: "text" as const,
        content: "Hello from Status! 👋 This is a sample text status.",
        backgroundColor: "#1e40af", // Blue
        textColor: "#ffffff",
        font: "sans-serif",
        createdAt: now - 3600000, // 1 hour ago
      },
      {
        type: "text" as const,
        content: "Working on something exciting! 🚀",
        backgroundColor: "#059669", // Green
        textColor: "#ffffff",
        font: "serif",
        createdAt: now - 7200000, // 2 hours ago
      },
      {
        type: "text" as const,
        content: "Coffee break ☕ Be right back!",
        backgroundColor: "#dc2626", // Red
        textColor: "#ffffff",
        font: "monospace",
        createdAt: now - 10800000, // 3 hours ago
      },
    ];

    for (const sample of sampleStatuses) {
      const expiresAt = sample.createdAt + 24 * 60 * 60 * 1000; // 24 hours from creation

      // Only create if not expired
      if (expiresAt > now) {
        const statusId = await ctx.db.insert("statuses", {
          userId,
          workspaceId: args.workspaceId,
          type: sample.type,
          content: sample.content,
          backgroundColor: sample.backgroundColor,
          textColor: sample.textColor,
          font: sample.font,
          viewCount: Math.floor(Math.random() * 10), // Random view count
          createdAt: sample.createdAt,
          expiresAt,
        });

        statusIds.push(statusId as Id<"statuses">);
      }
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "status.seed",
      resourceType: "status",
      metadata: { count: statusIds.length },
    });

    return statusIds;
  },
});

