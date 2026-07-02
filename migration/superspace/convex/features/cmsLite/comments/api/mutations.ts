import { mutation } from "../../_generated";
import { v, ConvexError } from "convex/values";
import { logAuditEvent } from "../../../lib/audit";
import { ensureWorkspaceMembership, requireAdmin } from "../../../lib/rbac";


/**
 * Create a new comment thread
 */
export const createThread = mutation({
  args: {
    workspaceId: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    title: v.optional(v.string()),
    initialComment: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.object({
    threadId: v.id("cmsLiteCommentThreads"),
    commentId: v.id("cmsLiteComments"),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Workspace gate — caller must be a member of the workspace they're
    // creating the thread in (C1 cross-tenant write fix).
    await ensureWorkspaceMembership(ctx, args.workspaceId);

    // Create thread
    const threadId = await ctx.db.insert("cmsLiteCommentThreads", {
      workspaceId: args.workspaceId,
      entityType: args.entityType,
      entityId: args.entityId,
      status: "open",
      title: args.title,
      commentCount: 1,
      lastCommentAt: Date.now(),
      lastCommentBy: identity.subject,
      tags: args.tags,
      createdBy: identity.subject,
      updatedBy: identity.subject,
    });

    // Create initial comment
    const commentId = await ctx.db.insert("cmsLiteComments", {
      threadId,
      authorId: identity.subject,
      authorName: identity.name ?? "Unknown User",
      content: args.initialComment,
      status: "published",
      createdBy: identity.subject,
      updatedBy: identity.subject,
    });

    // Extract and create mentions
    const mentions = extractMentions(args.initialComment);
    for (const userId of mentions) {
      await ctx.db.insert("cmsLiteCommentMentions", {
        commentId,
        userId,
        notified: false,
        createdBy: identity.subject,
      });
    }

    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actor: identity.subject,
      resourceType: "commentThread",
      resourceId: threadId,
      action: "comments.create_thread",
      changes: { title: args.title, entityType: args.entityType, entityId: args.entityId },
    });

    return { threadId, commentId };
  },
});

/**
 * Add a comment to a thread
 */
export const addComment = mutation({
  args: {
    threadId: v.id("cmsLiteCommentThreads"),
    content: v.string(),
    replyToId: v.optional(v.union(v.id("cmsLiteComments"), v.null())),
    attachments: v.optional(
      v.array(
        v.object({
          fileId: v.string(),
          fileName: v.string(),
          fileType: v.string(),
          fileSize: v.number(),
        }),
      ),
    ),
  },
  returns: v.object({
    commentId: v.id("cmsLiteComments"),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    // Verify thread exists
    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found");
    }

    // C1 cross-tenant write fix — caller must be a member of the thread's
    // workspace before they can post into it.
    await ensureWorkspaceMembership(ctx, thread.workspaceId);

    // If replying, verify parent comment exists
    if (args.replyToId) {
      const parentComment = await ctx.db.get(args.replyToId);
      if (!parentComment || parentComment.threadId !== args.threadId) {
        throw new ConvexError("Invalid reply reference");
      }
    }

    // Create comment
    const commentId = await ctx.db.insert("cmsLiteComments", {
      threadId: args.threadId,
      authorId: identity.subject,
      authorName: identity.name ?? "Unknown User",
      content: args.content,
      replyToId: args.replyToId,
      status: "published",
      attachments: args.attachments,
      createdBy: identity.subject,
      updatedBy: identity.subject,
    });

    // Update thread
    await ctx.db.patch(args.threadId, {
      commentCount: thread.commentCount + 1,
      lastCommentAt: Date.now(),
      lastCommentBy: identity.subject,
      updatedBy: identity.subject,
    });

    // Extract and create mentions
    const mentions = extractMentions(args.content);
    for (const userId of mentions) {
      await ctx.db.insert("cmsLiteCommentMentions", {
        commentId,
        userId,
        notified: false,
        createdBy: identity.subject,
      });
    }

    await logAuditEvent(ctx, {
      workspaceId: thread.workspaceId,
      actor: identity.subject,
      resourceType: "comment",
      resourceId: commentId,
      action: "comments.add_comment",
      changes: { threadId: args.threadId },
    });

    return { commentId };
  },
});

/**
 * Update comment status (for moderation)
 */
export const updateCommentStatus = mutation({
  args: {
    commentId: v.id("cmsLiteComments"),
    status: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Moderation op — require Admin. Non-admin users can only create/edit
    // their own comments; approving/hiding/flagging belongs to a moderator
    // (RBAC audit 2026-04-23, closes the TODO at previous line 181).
    const actor = await requireAdmin(ctx);

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }

    const thread = await ctx.db.get(comment.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found for comment");
    }

    // C1 cross-tenant write fix — admin must also be a member of the
    // thread's workspace before they can moderate comments in it.
    await ensureWorkspaceMembership(ctx, thread.workspaceId);

    await ctx.db.patch(args.commentId, {
      status: args.status,
      updatedBy: String(actor.adminUserId),
    });

    await logAuditEvent(ctx, {
      workspaceId: thread.workspaceId,
      actor: String(actor.adminUserId),
      resourceType: "comment",
      resourceId: args.commentId,
      action: "comments.update_status",
      changes: { status: args.status },
    });

    return null;
  },
});

/**
 * Add a reaction to a comment
 */
export const addReaction = mutation({
  args: {
    commentId: v.id("cmsLiteComments"),
    type: v.string(), // e.g., "like", "heart", "laugh"
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Unauthorized");
    }

    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new ConvexError("Comment not found");
    }

    const thread = await ctx.db.get(comment.threadId);
    if (!thread) {
      throw new ConvexError("Thread not found for comment");
    }

    // C1 cross-tenant write fix — caller must be a member of the thread's
    // workspace before they can react to comments in it.
    await ensureWorkspaceMembership(ctx, thread.workspaceId);

    const reactions = comment.reactions || [];
    const existingReaction = reactions.find(
      (r) => r.userId === identity.subject && r.type === args.type,
    );

    if (!existingReaction) {
      reactions.push({
        type: args.type,
        userId: identity.subject,
        timestamp: Date.now(),
      });

      await ctx.db.patch(args.commentId, {
        reactions,
        updatedBy: identity.subject,
      });

      await logAuditEvent(ctx, {
        workspaceId: thread.workspaceId,
        actor: identity.subject,
        resourceType: "comment",
        resourceId: args.commentId,
        action: "comments.add_reaction",
        changes: { type: args.type },
      });
    }

    return null;
  },
});

// Helper function to extract @mentions from comment content
function extractMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const matches = content.match(mentionRegex);
  return matches ? matches.map((m) => m.substring(1)) : [];
}
