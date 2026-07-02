import { defineTable } from "convex/server";
import { v } from "convex/values";

export const documents = defineTable({
  title: v.string(),
  workspaceId: v.id("workspaces"),
  createdBy: v.id("users"),
  isPublic: v.boolean(),
  content: v.optional(v.string()),
  parentId: v.optional(v.id("documents")),
  lastModified: v.optional(v.number()),
  metadata: v.optional(
    v.object({
      description: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      lastEditedBy: v.optional(v.id("users")),
      version: v.optional(v.number()),
    }),
  ),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_creator", ["createdBy"])
  .index("by_isPublic", ["isPublic"])
  .index("by_parent", ["parentId"])
  .searchIndex("search_documents", {
    searchField: "title",
    filterFields: ["workspaceId", "isPublic", "createdBy"],
  })
  .searchIndex("search_body", {
    searchField: "content",
    filterFields: ["workspaceId", "isPublic", "createdBy"],
  });

export const comments = defineTable({
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
  authorId: v.id("users"),
  content: v.string(),
  parentId: v.optional(v.id("comments")),
  isResolved: v.boolean(),
  mentions: v.optional(v.array(v.id("users"))),
  attachments: v.optional(v.array(v.id("_storage"))),
  position: v.optional(
    v.object({
      start: v.number(),
      end: v.number(),
    }),
  ),
  metadata: v.optional(
    v.object({
      edited: v.optional(v.boolean()),
      editedAt: v.optional(v.number()),
    }),
  ),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_entity", ["entityType", "entityId"])
  .index("by_author", ["authorId"])
  .index("by_parent", ["parentId"]);

export const documentPresence = defineTable({
  documentId: v.id("documents"),
  userId: v.id("users"),
  cursor: v.optional(
    v.object({
      x: v.number(),
      y: v.number(),
    }),
  ),
  lastSeen: v.number(),
}).index("by_document", ["documentId"]);

export const docsTables = {
  documents,
  comments,
  documentPresence,
};
