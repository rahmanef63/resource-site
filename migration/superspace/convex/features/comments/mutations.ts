import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMS } from "../../workspace/permissions"
import { logAuditEvent } from "../../shared/audit";


/**
 * Create a new comment
 */
export const createComment = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.union(
      v.literal("document"),
      v.literal("page"),
      v.literal("task"),
      v.literal("project"),
      v.literal("file"),
      v.literal("dbRow"),
    ),
    entityId: v.string(),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
    mentions: v.optional(v.array(v.id("users"))),
    attachments: v.optional(v.array(v.id("_storage"))),
    position: v.optional(v.object({
      start: v.number(),
      end: v.number(),
    })),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.COMMENTS_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const commentId = await ctx.db.insert("comments", {
      workspaceId: args.workspaceId,
      entityType: args.entityType,
      entityId: args.entityId,
      authorId: userId,
      content: args.content,
      parentId: args.parentId,
      isResolved: false,
      mentions: args.mentions,
      attachments: args.attachments,
      position: args.position,
    });

    // TODO: Create notifications for mentions
    if (args.mentions && args.mentions.length > 0) {
      for (const mentionedUserId of args.mentions) {
        await ctx.db.insert("systemNotifications", {
          workspaceId: args.workspaceId,
          userId: mentionedUserId,
          type: "mention",
          title: "You were mentioned",
          message: `You were mentioned in a comment on ${args.entityType}`,
          entityType: args.entityType,
          entityId: args.entityId,
          isRead: false,
          actorId: userId,
        });
      }
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "comment.create",
      resourceType: "comment",
      resourceId: commentId,
      metadata: {
        entityType: args.entityType,
        entityId: args.entityId,
        parentId: args.parentId,
      },
    });

    return commentId;
  },
});

/**
 * Update a comment
 */
export const updateComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    await requirePermission(ctx, comment.workspaceId, PERMS.COMMENTS_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.commentId, {
      content: args.content,
      metadata: {
        edited: true,
        editedAt: Date.now(),
      },
    });

    await logAuditEvent(ctx, {
      workspaceId: comment.workspaceId,
      actorUserId: userId,
      action: "comment.update",
      resourceType: "comment",
      resourceId: args.commentId,
      changes: { content: args.content },
    });

    return null;
  },
});

/**
 * Delete a comment
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    await requirePermission(ctx, comment.workspaceId, PERMS.COMMENTS_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Delete all replies first
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.commentId))
      .take(1000);

    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }

    await ctx.db.delete(args.commentId);

    await logAuditEvent(ctx, {
      workspaceId: comment.workspaceId,
      actorUserId: userId,
      action: "comment.delete",
      resourceType: "comment",
      resourceId: args.commentId,
      metadata: { replyCount: replies.length },
    });

    return null;
  },
});

/**
 * Resolve a comment
 */
export const resolveComment = mutation({
  args: {
    commentId: v.id("comments"),
    resolved: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) throw new Error("Comment not found");
    await requirePermission(ctx, comment.workspaceId, PERMS.COMMENTS_MANAGE);
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.commentId, {
      isResolved: args.resolved,
    });

    await logAuditEvent(ctx, {
      workspaceId: comment.workspaceId,
      actorUserId: userId,
      action: "comment.resolve",
      resourceType: "comment",
      resourceId: args.commentId,
      changes: { isResolved: args.resolved },
    });

    return null;
  },
});
