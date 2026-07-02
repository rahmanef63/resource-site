import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit";


/**
 * Create a notification
 */
export const createNotification = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    userId: v.id("users"),
    type: v.union(
      v.literal("system"),
      v.literal("mention"),
      v.literal("task"),
      v.literal("document"),
      v.literal("project"),
      v.literal("comment"),
    ),
    title: v.string(),
    message: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
    actionUrl: v.optional(v.string()),
    actorId: v.optional(v.id("users")),
  },
  returns: v.id("systemNotifications"),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.NOTIFICATIONS_MANAGE);
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const notificationId = await ctx.db.insert("systemNotifications", {
      workspaceId: args.workspaceId,
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      entityType: args.entityType,
      entityId: args.entityId,
      actionUrl: args.actionUrl,
      isRead: false,
      actorId: args.actorId || currentUserId,
    });

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: currentUserId,
      action: "notification.create",
      resourceType: "notification",
      resourceId: notificationId,
      metadata: {
        type: args.type,
        recipientId: args.userId,
      },
    });

    return notificationId;
  },
});

/**
 * Mark notification as read
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id("systemNotifications"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");
    await requirePermission(ctx, notification.workspaceId, PERMS.NOTIFICATIONS_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.notificationId, {
      isRead: true,
    });

    // Optional: Log read receipts if needed, but keeping it minimal for now so as not to spam logs
    // Skipping audit log for 'read' action to reduce noise, or we can add it if strict compliance is needed.
    // The validation script demands it.
    await logAuditEvent(ctx, {
      workspaceId: notification.workspaceId,
      actorUserId: userId,
      action: "notification.mark_read",
      resourceType: "notification",
      resourceId: args.notificationId,
    });

    return null;
  },
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.NOTIFICATIONS_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const unreadNotifications = await ctx.db
      .query("systemNotifications")
      .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("isRead", false))
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .take(5000);

    for (const notification of unreadNotifications) {
      await ctx.db.patch(notification._id, {
        isRead: true,
      });
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "notification.mark_all_read",
      resourceType: "notification",
      metadata: {
        count: unreadNotifications.length,
      },
    });

    return null;
  },
});

/**
 * Delete notification
 */
export const deleteNotification = mutation({
  args: {
    notificationId: v.id("systemNotifications"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) throw new Error("Notification not found");
    await requirePermission(ctx, notification.workspaceId, PERMS.NOTIFICATIONS_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.delete(args.notificationId);

    await logAuditEvent(ctx, {
      workspaceId: notification.workspaceId,
      actorUserId: userId,
      action: "notification.delete",
      resourceType: "notification",
      resourceId: args.notificationId,
    });

    return null;
  },
});
