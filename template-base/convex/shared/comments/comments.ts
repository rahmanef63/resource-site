import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import { getUserByExternalId } from "../auth";

async function requireUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");
  const user = await getUserByExternalId(ctx, identity.subject);
  if (!user) throw new Error("User not found");
  return user;
}

export const addComment = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
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
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    const commentId = await ctx.db.insert("comments", {
      workspaceId: args.workspaceId,
      entityType: args.entityType,
      entityId: args.entityId,
      authorId: user._id,
      content: args.content,
      parentId: args.parentId,
      isResolved: false,
      mentions: args.mentions,
      attachments: args.attachments,
      position: args.position,
    });

    // minimal thread summary maintenance
    const existingThread = await ctx.db
      .query("commentThreads")
      .withIndex("by_entity", (q) => 
        q.eq("entityType", args.entityType).eq("entityId", args.entityId)
      )
      .first();

    const now = Date.now();
    if (existingThread) {
      await ctx.db.patch(existingThread._id, {
        commentCount: existingThread.commentCount + 1,
        participantCount: existingThread.participantCount + 1,
        lastCommentAt: now,
        lastCommentBy: user._id,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("commentThreads", {
        workspaceId: args.workspaceId,
        entityType: args.entityType,
        entityId: args.entityId,
        commentCount: 1,
        participantCount: 1,
        lastCommentAt: now,
        lastCommentBy: user._id,
        isResolved: false,
        resolvedAt: undefined,
        resolvedBy: undefined,
        priority: "normal",
        assignees: [],
        tags: [],
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true, commentId };
  },
});

export const editComment = mutation({
  args: {
    commentId: v.id("comments"),
    workspaceId: v.id("workspaces"),
    content: v.string(),
    mentions: v.optional(v.array(v.id("users"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.workspaceId !== args.workspaceId) throw new Error("Comment not found");
    if (comment.authorId !== user._id) throw new Error("Unauthorized");

    await ctx.db.patch(args.commentId, {
      content: args.content,
      mentions: args.mentions ?? comment.mentions,
      metadata: {
        ...(comment.metadata as Record<string, unknown> ?? {}),
        edited: true,
        editedAt: Date.now(),
      },
    });
    return null;
  },
});

export const deleteComment = mutation({
  args: { commentId: v.id("comments"), workspaceId: v.id("workspaces") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(args.commentId);
    if (!comment || comment.workspaceId !== args.workspaceId) throw new Error("Comment not found");
    if (comment.authorId !== user._id) throw new Error("Unauthorized");

    // Delete the comment entirely
    await ctx.db.delete(args.commentId);
    return null;
  },
});

export const listComments = query({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    entityId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const results = await ctx.db
      .query("comments")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", args.entityType).eq("entityId", args.entityId)
      )
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .collect();

    return results;
  },
});
