import { defineTable } from "convex/server";
import { v } from "convex/values";

export const tables = {
  cmsLiteCommentThreads: defineTable({
    // Workspace context
    workspaceId: v.string(),
    // The entity this thread is attached to (e.g., "product", "post", "portfolio")
    entityType: v.string(),
    // The specific entity ID
    entityId: v.string(),
    // Thread status (open, closed, archived)
    status: v.string(),
    // Thread title/subject (optional)
    title: v.optional(v.string()),
    // Total comment count in thread
    commentCount: v.number(),
    // Last comment timestamp
    lastCommentAt: v.number(),
    // Last comment author
    lastCommentBy: v.optional(v.string()),
    // Tags for categorization
    tags: v.optional(v.array(v.string())),
    // Metadata
    createdBy: v.optional(v.union(v.string(), v.null())),
    updatedBy: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_status", ["status"])
    .index("by_activity", ["lastCommentAt"]),

  cmsLiteComments: defineTable({
    // Reference to parent thread
    threadId: v.id("cmsLiteCommentThreads"),
    // Author details
    authorId: v.string(),
    authorName: v.string(),
    // Comment content
    content: v.string(),
    // Optional reply reference
    replyToId: v.optional(v.union(v.id("cmsLiteComments"), v.null())),
    // Moderation status (published, pending, hidden)
    status: v.string(),
    // Reactions/likes
    reactions: v.optional(
      v.array(
        v.object({
          type: v.string(),
          userId: v.string(),
          timestamp: v.number(),
        }),
      ),
    ),
    // Optional attachments
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
    // Metadata
    createdBy: v.optional(v.union(v.string(), v.null())),
    updatedBy: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_thread", ["threadId"])
    .index("by_author", ["authorId"])
    .index("by_status", ["status"])
    .index("by_reply", ["replyToId"]),

  cmsLiteCommentMentions: defineTable({
    // Reference to the comment
    commentId: v.id("cmsLiteComments"),
    // User being mentioned
    userId: v.string(),
    // Has the user been notified?
    notified: v.boolean(),
    // When was the notification sent
    notifiedAt: v.optional(v.number()),
    // Metadata
    createdBy: v.optional(v.union(v.string(), v.null())),
  })
    .index("by_comment", ["commentId"])
    .index("by_user", ["userId"])
    .index("by_notification", ["notified"]),
} as const;
