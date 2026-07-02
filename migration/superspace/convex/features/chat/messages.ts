import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation, internalAction } from "../../_generated/server";
// any-api escape hatch: `internal.features.chat.messages.generateAIResponse`
// trips TS2589 (self-referential api type) under some tsc versions, and a
// direct named import re-introduces the deep type. Resolve at runtime via
// a star import cast to any.
import * as _ApiModule from "../../_generated/api";
const internal: any = (_ApiModule as any).internal;
import { ensureUser, getExistingUserId, requireActiveMembership, requirePermission, resolveCandidateUserIds } from "../../auth/helpers";
import { logAuditEvent } from "../../shared/audit";
import { checkStorageQuota } from "../../lib/quota";

// Get conversation messages
export const getConversationMessages = query({
  args: {
    conversationId: v.id("conversations"),
    limit: v.optional(v.number()),
    before: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    const candidates = await resolveCandidateUserIds(ctx);
    
    // Get the conversation to check its type
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return [];
    
    const conv: any = conversation;
    let hasAccess = false;

    // Check if user is a participant
    for (const idStr of candidates) {
      const p = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user_conversation", (q) =>
          q.eq("userId", idStr as any).eq("conversationId", args.conversationId)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .first();
      if (p) { hasAccess = true; break; }
    }

    // For group conversations (channels), allow access if user is a workspace member
    if (!hasAccess && conv.type === "group" && conv.workspaceId) {
      for (const idStr of candidates) {
        const membership = await ctx.db
          .query("workspaceMemberships")
          .withIndex("by_workspace_user", (q) =>
            q.eq("workspaceId", conv.workspaceId).eq("userId", idStr as any)
          )
          .first();
        if (membership && membership.status === "active") {
          hasAccess = true;
          break;
        }
      }
    }

    if (!hasAccess) return [];

    let q = ctx.db
      .query("messages")
      .withIndex("by_conversation", (qb) => qb.eq("conversationId", args.conversationId))
      .filter((qb) => qb.eq(qb.field("deletedAt"), undefined))
      .order("desc");

    if (args.before) {
      q = q.filter((qb) => qb.lt(qb.field("_creationTime"), args.before!));
    }

    const messages = await q.take(args.limit || 50);

    const withDetails = await Promise.all(
      messages.map(async (message) => {
        const author = message.senderId ? await ctx.db.get(message.senderId) : null;
        const reactions = await ctx.db
          .query("messageReactions")
          .withIndex("by_message", (qb) => qb.eq("messageId", message._id))
          .take(1000);

        const grouped = reactions.reduce((acc: Record<string, { emoji: string; count: number; users: any[] }>, r: any) => {
          if (!acc[r.emoji]) acc[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
          acc[r.emoji].count += 1;
          acc[r.emoji].users.push(r.userId);
          return acc;
        }, {});

        // Resolve a preview URL for attachments (best effort)
        let attachmentUrl: string | null = null;
        const storageId =
          (message.metadata as any)?.storageId ??
          ((message.metadata as any)?.storageIds?.[0] as any);
        if (storageId) {
          try {
            attachmentUrl = await ctx.storage.getUrl(storageId as any);
          } catch {
            attachmentUrl = null;
          }
        }

        return {
          ...message,
          author,           // keep for backward compatibility
          sender: author,   // new alias
          reactions: Object.values(grouped),
          attachmentUrl,
        } as any;
      })
    );

    return withDetails.reverse();
  },
});

// Get recent messages for notifications
export const getRecentMessages = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) return [];

    // Get conversations in this workspace
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .take(1000);

    const conversationIds = conversations.map(c => c._id);
    
    if (conversationIds.length === 0) return [];

    // Get recent messages from all conversations
    const messages = await ctx.db
      .query("messages")
      .order("desc")
      .take(args.limit || 10);

    // Filter messages that belong to workspace conversations
    const workspaceMessages = messages.filter(msg => 
      conversationIds.includes(msg.conversationId)
    );

    // Get author information
    const messagesWithAuthors = await Promise.all(
      workspaceMessages.map(async (message) => {
        const author = message.senderId ? await ctx.db.get(message.senderId) : null;
        return {
          ...message,
          author,
        };
      })
    );

    return messagesWithAuthors;
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
    type: v.optional(v.union(v.literal("text"), v.literal("image"), v.literal("file"))),
    fileId: v.optional(v.id("_storage")),
    replyToId: v.optional(v.id("messages")),
    metadata: v.optional(v.object({
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
    })),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user is part of the conversation
    const convMeta = await ctx.db.get(args.conversationId);
    if (!convMeta) throw new Error("Conversation not found");

    const conv: any = convMeta;

    // Check if user is a participant (by any candidate id to account for legacy rows)
    const candidateIds = await resolveCandidateUserIds(ctx);
    let participant: any = null;
    for (const idStr of candidateIds) {
      const p = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user_conversation", (q) => 
          q.eq("userId", idStr as any).eq("conversationId", args.conversationId)
        )
        .first();
      if (p && p.isActive) { participant = p; break; }
    }

    // For group conversations (channels), allow workspace members to send messages
    // and auto-join them to the channel
    if (!participant && conv.type === "group" && conv.workspaceId) {
      let isMember = false;
      for (const idStr of candidateIds) {
        const membership = await ctx.db
          .query("workspaceMemberships")
          .withIndex("by_workspace_user", (q) =>
            q.eq("workspaceId", conv.workspaceId).eq("userId", idStr as any)
          )
          .first();
        if (membership && membership.status === "active") {
          isMember = true;
          break;
        }
      }
      
      if (isMember) {
        // Auto-join the user to the channel
        await ctx.db.insert("conversationParticipants", {
          conversationId: args.conversationId,
          userId,
          role: "member",
          joinedAt: Date.now(),
          isActive: true,
        });
        participant = { userId, role: "member", isActive: true };
      }
    }

    if (!participant) throw new Error("Not authorized to send messages in this conversation");

    // Heal: ensure a participation row exists for the current userId
    if (participant.userId !== userId) {
      const existingForCurrent = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user_conversation", (q) =>
          q.eq("userId", userId).eq("conversationId", args.conversationId)
        )
        .first();
      if (!existingForCurrent) {
        await ctx.db.insert("conversationParticipants", {
          conversationId: args.conversationId,
          userId,
          role: "member",
          joinedAt: Date.now(),
          isActive: true,
        });
      }
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: userId,
      content: args.content,
      type: args.type || "text",
      replyToId: args.replyToId,
      metadata: args.metadata ?? (args.fileId ? { storageId: args.fileId } : undefined),
    });

    // Update conversation's last message time
    await ctx.db.patch(args.conversationId, {
      lastMessageAt: Date.now(),
    });

    // Optional AI response scheduling
    const convForAi = await ctx.db.get(args.conversationId);
    if (convForAi?.type === "ai" && process.env.CONVEX_OPENAI_API_KEY && process.env.CONVEX_OPENAI_BASE_URL) {
      try {
        const fnRef = internal.features.chat.messages.generateAIResponse;
        const scheduler: any = ctx.scheduler;
        await scheduler.runAfter(1000, fnRef, {
          conversationId: args.conversationId,
          userMessageId: messageId,
        });
      } catch (e) {
        console.warn("AI scheduling failed:", e);
      }
    }

    // Audit log (only for workspace conversations)
    if (convMeta.workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId: convMeta.workspaceId,
        actorUserId: userId,
        action: "message.sent",
        resourceType: "messages",
        resourceId: messageId,
        metadata: { 
          conversationId: args.conversationId,
          type: args.type || "text",
          hasReply: !!args.replyToId,
        },
      });
    }

    return messageId;
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Only the author can delete their message
    if (message.senderId !== userId) {
      throw new Error("Not authorized to delete this message");
    }

    // Get conversation for workspaceId
    const conversation = await ctx.db.get(message.conversationId);
    const workspaceId = conversation?.workspaceId;

    await ctx.db.delete(args.messageId);

    // Audit log (only for workspace conversations)
    if (workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId,
        actorUserId: userId,
        action: "message.deleted",
        resourceType: "messages",
        resourceId: args.messageId,
        metadata: { conversationId: message.conversationId },
      });
    }
  },
});

// Edit a message
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // Only the author can edit their message
    if (message.senderId !== userId) {
      throw new Error("Not authorized to edit this message");
    }

    // Get conversation for workspaceId
    const conversation = await ctx.db.get(message.conversationId);
    const workspaceId = conversation?.workspaceId;

    await ctx.db.patch(args.messageId, {
      content: args.content,
      editedAt: Date.now(),
    });

    // Audit log (only for workspace conversations)
    if (workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId,
        actorUserId: userId,
        action: "message.edited",
        resourceType: "messages",
        resourceId: args.messageId,
        metadata: { conversationId: message.conversationId },
      });
    }
  },
});

// Mark messages as read up to a specific messageId (updates participant.lastReadAt)
export const markReadTo = mutation({
  args: {
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const msg = await ctx.db.get(args.messageId);
    if (!msg || String(msg.conversationId) !== String(args.conversationId)) {
      throw new Error("Message not found in conversation");
    }

    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!participation) return;

    const current = participation.lastReadAt || 0;
    const targetTs = (msg as any)._creationTime || Date.now();
    if (targetTs > current) {
      await ctx.db.patch(participation._id, { lastReadAt: targetTs });
    }
  },
});

// Add reaction to message
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    // SEC: resolve conversation and verify caller is an active participant.
    // Previously any authenticated user could react to any message by ID,
    // leaking conversation existence and polluting reaction counts.
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const participant = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", conversation._id),
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    if (!participant) {
      throw new Error("Not a participant of this conversation");
    }

    // Check if user already reacted with this emoji
    const existingReaction = await ctx.db
      .query("messageReactions")
      .withIndex("by_message_user", (q) =>
        q.eq("messageId", args.messageId).eq("userId", userId)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .first();

    const workspaceId = conversation.workspaceId;

    // Toggle behavior: if exists -> remove; else -> insert
    let reactionId;
    if (existingReaction) {
      await ctx.db.delete(existingReaction._id);
    } else {
      reactionId = await ctx.db.insert("messageReactions", {
        messageId: args.messageId,
        userId,
        emoji: args.emoji,
      });
    }

    // Audit log (only for workspace conversations, only when adding)
    if (workspaceId && reactionId) {
      await logAuditEvent(ctx, {
        workspaceId,
        actorUserId: userId,
        action: "messageReaction.added",
        resourceType: "messageReactions",
        resourceId: reactionId,
        metadata: { 
          messageId: args.messageId,
          emoji: args.emoji,
        },
      });
    }
  },
});

// Remove reaction from message
export const removeReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get message and conversation, then verify caller is an active
    // participant before exposing reaction state.
    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");
    const conversation = await ctx.db.get(message.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const participant = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", conversation._id),
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    if (!participant) {
      throw new Error("Not a participant of this conversation");
    }

    const reaction = await ctx.db
      .query("messageReactions")
      .withIndex("by_message_user", (q) =>
        q.eq("messageId", args.messageId).eq("userId", userId)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .first();

    if (!reaction) {
      throw new Error("Reaction not found");
    }

    const workspaceId = conversation.workspaceId;

    await ctx.db.delete(reaction._id);

    // Audit log (only for workspace conversations)
    if (workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId,
        actorUserId: userId,
        action: "messageReaction.removed",
        resourceType: "messageReactions",
        resourceId: reaction._id,
        metadata: { 
          messageId: args.messageId,
          emoji: args.emoji,
        },
      });
    }
  },
});

// Search messages within a conversation
export const searchMessages = query({
  args: {
    conversationId: v.id("conversations"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const candidates = await resolveCandidateUserIds(ctx);
    let isParticipant = false;
    for (const idStr of candidates) {
      const p = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user_conversation", (q) =>
          q.eq("userId", idStr as any).eq("conversationId", args.conversationId)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .first();
      if (p) { isParticipant = true; break; }
    }
    if (!isParticipant) throw new Error("Not authorized");

    const results = await ctx.db
      .query("messages")
      .withSearchIndex("search_content", (q) =>
        q.search("content", args.query).eq("conversationId", args.conversationId).eq("type", "text")
      )
      .take(args.limit || 20);

    const withSenders = await Promise.all(
      results.map(async (m) => ({
        ...m,
        author: m.senderId ? await ctx.db.get(m.senderId) : null,
        sender: m.senderId ? await ctx.db.get(m.senderId) : null,
      }))
    );
    return withSenders;
  },
});

// File upload helpers
export const generateUploadUrl = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");
    // H4 fix: enforce workspace permission + quota before minting an upload URL
    // so signed-in users can't consume an arbitrary tenant's storage budget.
    await requirePermission(ctx, args.workspaceId, "files.upload");
    await checkStorageQuota(ctx, args.workspaceId);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrls = query({
  args: { storageIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getExistingUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // C3 fix: resolve each storageId via the `fileAttachments` table and verify
    // the caller is an active member of the file's workspace. Files without a
    // `fileAttachments` row (or that the user can't access) return null — we
    // never blindly hand out signed URLs from `ctx.storage.getUrl` alone.
    const urls = await Promise.all(
      args.storageIds.map(async (id) => {
        try {
          const file = await ctx.db
            .query("fileAttachments")
            .withIndex("by_storage", (q) => q.eq("storageId", id as any))
            .first();
          if (!file) return null;
          try {
            await requireActiveMembership(ctx, file.workspaceId);
          } catch {
            return null;
          }
          return await ctx.storage.getUrl(id as any);
        } catch {
          return null;
        }
      })
    );
    return urls;
  },
});

// Internal endpoints for optional AI reply pipeline
export const getConversationForAI = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});

export const getRecentMessagesForAI = internalQuery({
  args: { conversationId: v.id("conversations"), limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .take(args.limit);
  },
});

export const sendAIMessage = internalMutation({
  args: { conversationId: v.id("conversations"), content: v.string(), aiModel: v.string() },
  handler: async (ctx, args) => {
    const firstParticipant = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .first();
    if (!firstParticipant) throw new Error("No participants found");

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: firstParticipant.userId,
      content: args.content,
      type: "text",
      metadata: { aiModel: args.aiModel },
    });

    await ctx.db.patch(args.conversationId, { lastMessageAt: Date.now() });
    return messageId;
  },
});

export const generateAIResponse = internalAction({
  args: { conversationId: v.id("conversations"), userMessageId: v.id("messages") },
  handler: async (ctx, args) => {
    const conversation = await ctx.runQuery(internal.features.chat.messages.getConversationForAI, { conversationId: args.conversationId });
    if (!conversation || conversation.type !== "ai") return;

    const recent = await ctx.runQuery(internal.features.chat.messages.getRecentMessagesForAI, { conversationId: args.conversationId, limit: 10 });

    // Build messages payload (very simple heuristic)
    const system = conversation.metadata?.systemPrompt ? conversation.metadata.systemPrompt + "\n\n" : "";
    const aiMessages = recent
      .slice()
      .reverse()
      .map((m: any, i: number) => ({
        role: m.metadata?.aiModel ? ("assistant" as const) : ("user" as const),
        content: (i === recent.length - 1 && system ? system : "") + (m.content || ""),
      }));

    if (!process.env.CONVEX_OPENAI_API_KEY || !process.env.CONVEX_OPENAI_BASE_URL) return;

    try {
      const resp = await fetch(`${process.env.CONVEX_OPENAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.CONVEX_OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: conversation.metadata?.aiModel || "gpt-4.1-nano",
          messages: aiMessages,
          max_tokens: 1000,
        }),
      });
      const data = await resp.json();
      const aiContent = data?.choices?.[0]?.message?.content;
      if (aiContent) {
        await ctx.runMutation(internal.features.chat.messages.sendAIMessage, {
          conversationId: args.conversationId,
          content: aiContent,
          aiModel: conversation.metadata?.aiModel || "gpt-4.1-nano",
        });
      }
    } catch (err) {
      console.error("AI response generation failed", err);
      await ctx.runMutation(internal.features.chat.messages.sendAIMessage, {
        conversationId: args.conversationId,
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
        aiModel: "error",
      });
    }
  },
});
