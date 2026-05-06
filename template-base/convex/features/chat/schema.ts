import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conversations = defineTable({
  name: v.optional(v.string()),
  type: v.union(v.literal("personal"), v.literal("group"), v.literal("ai")),
  workspaceId: v.optional(v.id("workspaces")),
  createdBy: v.id("users"),
  isActive: v.boolean(),
  lastMessageAt: v.optional(v.number()),
  metadata: v.optional(
    v.object({
      description: v.optional(v.string()),
      avatar: v.optional(v.string()),
      aiModel: v.optional(v.string()),
      systemPrompt: v.optional(v.string()),
      isFavorite: v.optional(v.boolean()),
      isPinned: v.optional(v.boolean()),
      isMuted: v.optional(v.boolean()),
      isDraft: v.optional(v.boolean()),
      isArchived: v.optional(v.boolean()),
      archivedAt: v.optional(v.number()),
      archivedBy: v.optional(v.id("users")),
      labels: v.optional(v.array(v.string())),
    }),
  ),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_creator", ["createdBy"])
  .index("by_type", ["type"]);

export const conversationParticipants = defineTable({
  conversationId: v.id("conversations"),
  userId: v.id("users"),
  role: v.union(v.literal("admin"), v.literal("member")),
  joinedAt: v.number(),
  lastReadAt: v.optional(v.number()),
  isActive: v.boolean(),
})
  .index("by_conversation", ["conversationId"])
  .index("by_user", ["userId"])
  .index("by_user_conversation", ["userId", "conversationId"]);

export const messages = defineTable({
  conversationId: v.id("conversations"),
  senderId: v.id("users"),
  content: v.string(),
  type: v.union(v.literal("text"), v.literal("image"), v.literal("file")),
  replyToId: v.optional(v.id("messages")),
  editedAt: v.optional(v.number()),
  deletedAt: v.optional(v.number()),
  metadata: v.optional(
    v.object({
      fileName: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      mimeType: v.optional(v.string()),
      storageId: v.optional(v.id("_storage")),
      storageIds: v.optional(v.array(v.string())),
      fileNames: v.optional(v.array(v.string())),
      fileSizes: v.optional(v.array(v.number())),
      mimeTypes: v.optional(v.array(v.string())),
      aiModel: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      mentions: v.optional(v.array(v.string())),
    }),
  ),
})
  .index("by_conversation", ["conversationId"])
  .index("by_sender", ["senderId"])
  .searchIndex("search_content", {
    searchField: "content",
    filterFields: ["conversationId", "type"],
  });

export const messageReactions = defineTable({
  messageId: v.id("messages"),
  userId: v.id("users"),
  emoji: v.string(),
})
  .index("by_message", ["messageId"])
  .index("by_user", ["userId"])
  .index("by_message_user", ["messageId", "userId"]);

export const chatTables = {
  conversations,
  conversationParticipants,
  messages,
  messageReactions,
};
