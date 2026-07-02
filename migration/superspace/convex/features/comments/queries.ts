import { v } from "convex/values";
import { query } from "../../_generated/server";
import type { Doc } from "../../_generated/dataModel";
import { getExistingUserId, resolveCandidateUserIds, requireActiveMembership } from "../../auth/helpers";

// Document shape of the `comments` table (registered from shared/comments/schema.ts).
// Used to build concrete return validators instead of v.any(). Joined fields
// (author, mentionedUsers, replies) stay loose as nullable join values.
const commentFields = {
  _id: v.id("comments"),
  _creationTime: v.number(),
  workspaceId: v.id("workspaces"),
  entityType: v.string(),
  entityId: v.string(),
  authorId: v.id("users"),
  content: v.string(),
  parentId: v.optional(v.id("comments")),
  isResolved: v.boolean(),
  mentions: v.optional(v.array(v.id("users"))),
  attachments: v.optional(v.array(v.id("_storage"))),
  position: v.optional(v.object({ start: v.number(), end: v.number() })),
  metadata: v.optional(v.any()),
};

/**
 * Get comments for a specific entity
 */
export const getEntityComments = query({
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
  },
  returns: v.array(
    v.object({
      ...commentFields,
      author: v.any(),
      mentionedUsers: v.array(v.any()),
      repliesCount: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_entity", (q) =>
        q.eq("entityType", args.entityType).eq("entityId", args.entityId)
      )
      .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
      .take(1000);

    // Get author details for each comment
    const commentsWithAuthors = await Promise.all(
      comments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);

        // Get mention user details
        const mentionedUsers: Array<Doc<"users"> | null> =
          comment.mentions && comment.mentions.length > 0
            ? await Promise.all(comment.mentions.map((mentionedId) => ctx.db.get(mentionedId)))
            : [];

        // Get replies count
        const repliesCount = await ctx.db
          .query("comments")
          .withIndex("by_parent", (q) => q.eq("parentId", comment._id))
          .take(1000)
          .then(replies => replies.length);

        return {
          ...comment,
          author,
          mentionedUsers,
          repliesCount,
        };
      })
    );

    return commentsWithAuthors;
  },
});

/**
 * Get a single comment with its thread
 */
export const getCommentThread = query({
  args: {
    commentId: v.id("comments"),
  },
  returns: v.union(
    v.object({
      ...commentFields,
      author: v.any(),
      replies: v.array(v.any()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) return null;

    await requireActiveMembership(ctx, comment.workspaceId);

    const author = await ctx.db.get(comment.authorId);

    // Get all replies
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.commentId))
      .take(1000);

    const repliesWithAuthors = await Promise.all(
      replies.map(async (reply) => {
        const replyAuthor = await ctx.db.get(reply.authorId);
        return {
          ...reply,
          author: replyAuthor,
        };
      })
    );

    return {
      ...comment,
      author,
      replies: repliesWithAuthors,
    };
  },
});

/**
 * Search comments within a workspace
 */
export const searchComments = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
    entityType: v.optional(v.union(
      v.literal("document"),
      v.literal("page"),
      v.literal("task"),
      v.literal("project"),
      v.literal("file"),
      v.literal("dbRow"),
    )),
  },
  returns: v.array(v.object({ ...commentFields, author: v.any() })),
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId);

    let query = ctx.db
      .query("comments")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) =>
        q.and(
          args.entityType
            ? q.eq(q.field("entityType"), args.entityType)
            : q.neq(q.field("entityType"), ""), // Always true condition
          q.or(
            // Simple text search (case-insensitive would require full-text search)
            q.eq(q.field("content"), args.query),
            q.neq(q.field("content"), "") // Fallback: we'll filter in memory
          )
        )
      );

    const comments = await query.take(1000);

    // Filter in memory for simple contains search
    const searchLower = args.query.toLowerCase();
    const filtered = comments.filter(c =>
      c.content.toLowerCase().includes(searchLower)
    );

    const withAuthors = await Promise.all(
      filtered.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        return {
          ...comment,
          author,
        };
      })
    );

    return withAuthors;
  },
});
