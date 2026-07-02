import { defineTable } from "convex/server";
import { v } from "convex/values";

export const commentsTable = defineTable({
  createdBy: v.optional(v.union(v.string(), v.null())),
  updatedBy: v.optional(v.union(v.string(), v.null())),
  replyToId: v.optional(v.union(v.id("comments"), v.null())),
  attachments: v.optional(v.array(v.object({
    fileName: v.string(),
    fileSize: v.number(),
    fileId: v.string(),
    fileType: v.string(),
  }))),
  authorId: v.string(),
  threadId: v.string(),
  entityId: v.string(),
  content: v.string(),
  status: v.union(v.literal("active"), v.literal("deleted"), v.literal("hidden")),
  authorName: v.string(),
})
.index("by_status", ["status"])
.index("by_author", ["authorId"])
.index("by_thread", ["threadId"])
.index("by_reply", ["replyToId"])
.index("by_entity", ["entityId"]);