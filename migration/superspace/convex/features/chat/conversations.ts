import { v } from "convex/values";
import { query, mutation } from "../../_generated/server";
import { ensureUser, getExistingUserId, requirePermission, resolveCandidateUserIds, requireActiveMembership } from "../../auth/helpers";
import { PERMS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";

// Helper to enrich a conversation with participants, last message, etc.
async function enrichConversation(ctx: any, conversation: any, participation?: any) {
  const conv: any = conversation as any;
  
  // Get all participants
  const allParticipants = await ctx.db
    .query("conversationParticipants")
    .withIndex("by_conversation", (q: any) => q.eq("conversationId", conv._id))
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .take(1000);

  // Get participant user details
  const participantsWithUsers = await Promise.all(
    allParticipants.map(async (p: any) => {
      const user = await ctx.db.get(p.userId);
      return { ...p, user };
    })
  );

  // Get last message
  const lastMessage = await ctx.db
    .query("messages")
    .withIndex("by_conversation", (q: any) => q.eq("conversationId", conv._id))
    .filter((q: any) => q.eq(q.field("deletedAt"), undefined))
    .order("desc")
    .first();

  let lastMessageWithSender = null;
  if (lastMessage) {
    const sender = await ctx.db.get(lastMessage.senderId);
    lastMessageWithSender = {
      ...lastMessage,
      senderName: sender?.name,
    };
  }

  // Calculate unread count (only if user has participation record)
  let unreadCount = 0;
  if (participation) {
    unreadCount = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q: any) => q.eq("conversationId", conv._id))
      .filter((q: any) =>
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.gt(q.field("_creationTime"), participation.lastReadAt || 0)
        )
      )
      .take(1000)
      .then((messages: any[]) => messages.length);
  }

  return {
    ...conversation,
    participants: participantsWithUsers,
    lastMessage: lastMessageWithSender,
    unreadCount,
  };
}

// Get workspace conversations for current user
// - Personal (DM) conversations: only if user is a participant
// - Group conversations (channels): all workspace channels visible to all members
export const getWorkspaceConversations = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const candidateIds = await resolveCandidateUserIds(ctx);
    if (candidateIds.length === 0) return [];

    // Verify user is a workspace member
    let isMember = false;
    for (const idStr of candidateIds) {
      const membership = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_workspace_user", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("userId", idStr as any)
        )
        .first();
      if (membership && membership.status === "active") {
        isMember = true;
        break;
      }
    }
    if (!isMember) return [];

    // Build a map of user's participations
    const participationMap = new Map<string, any>();
    for (const idStr of candidateIds) {
      const rows = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user", (q) => q.eq("userId", idStr as any))
        .filter((q) => q.eq(q.field("isActive"), true))
        .take(1000);
      for (const r of rows) {
        participationMap.set(String(r.conversationId), r);
      }
    }

    // Get all "group" type conversations (channels) in this workspace
    // These are visible to all workspace members
    const groupConversations = await ctx.db
      .query("conversations")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => 
        q.and(
          q.eq(q.field("type"), "group"),
          q.eq(q.field("isActive"), true)
        )
      )
      .take(1000);

    // Get personal conversations where user is a participant
    const userParticipations = Array.from(participationMap.values());
    const personalConvDocs = await Promise.all(
      userParticipations.map((p) => ctx.db.get(p.conversationId))
    );
    const personalConversations: any[] = [];
    userParticipations.forEach((participation, idx) => {
      const conv: any = personalConvDocs[idx];
      if (conv && conv.workspaceId === args.workspaceId && conv.type === "personal") {
        personalConversations.push({ conversation: conv, participation });
      }
    });

    // Enrich group conversations
    const enrichedGroups = await Promise.all(
      groupConversations.map(async (conv) => {
        const participation = participationMap.get(String(conv._id));
        return enrichConversation(ctx, conv, participation);
      })
    );

    // Enrich personal conversations
    const enrichedPersonal = await Promise.all(
      personalConversations.map(async ({ conversation, participation }) => {
        return enrichConversation(ctx, conversation, participation);
      })
    );

    return [...enrichedGroups, ...enrichedPersonal].filter(Boolean);
  },
});

// Get global conversations (no workspace) for current user
export const getGlobalConversations = query({
  args: {},
  handler: async (ctx) => {
    const candidateIds = await resolveCandidateUserIds(ctx);
    if (candidateIds.length === 0) return [];

    const participationMap = new Map<string, any>();
    for (const idStr of candidateIds) {
      const rows = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user", (q) => q.eq("userId", idStr as any))
        .filter((q) => q.eq(q.field("isActive"), true))
        .take(1000);
      for (const r of rows) participationMap.set(String(r._id), r);
    }
    const participations = Array.from(participationMap.values());

    const conversations = await Promise.all(
      participations.map(async (participation) => {
        const conversation = await ctx.db.get(participation.conversationId);
        const conv: any = conversation as any;
        if (!conv || conv.workspaceId) return null; // global only

        const allParticipants = await ctx.db
          .query("conversationParticipants")
          .withIndex("by_conversation", (q) => q.eq("conversationId", (conv._id as any)))
          .filter((q) => q.eq(q.field("isActive"), true))
          .take(1000);

        const participantsWithUsers = await Promise.all(
          allParticipants.map(async (p) => {
            const user = await ctx.db.get(p.userId);
            return { ...p, user };
          })
        );

        const lastMessage = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", (conv._id as any)))
          .filter((q) => q.eq(q.field("deletedAt"), undefined))
          .order("desc")
          .first();

        let lastMessageWithSender = null;
        if (lastMessage) {
          const sender = await ctx.db.get(lastMessage.senderId);
          lastMessageWithSender = { ...lastMessage, senderName: sender?.name };
        }

        const unreadCount = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", (conv._id as any)))
          .filter((q) =>
            q.and(
              q.eq(q.field("deletedAt"), undefined),
              q.gt(q.field("_creationTime"), participation.lastReadAt || 0)
            )
          )
          .take(1000)
          .then((messages) => messages.length);

        return {
          ...conversation,
          participants: participantsWithUsers,
          lastMessage: lastMessageWithSender,
          unreadCount,
        };
      })
    );

    return conversations.filter(Boolean);
  },
});

// Get single conversation details
export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const candidateIds = await resolveCandidateUserIds(ctx);
    if (candidateIds.length === 0) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const conv: any = conversation;

    // Check if user is participant
    let participation: any = null;
    for (const idStr of candidateIds) {
      const p = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user_conversation", (q) =>
          q.eq("userId", idStr as any).eq("conversationId", args.conversationId)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .unique();
      if (p) { participation = p; break; }
    }

    // For group conversations (channels), allow access if user is a workspace member
    if (!participation && conv.type === "group" && conv.workspaceId) {
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
      if (!isMember) throw new Error("Not authorized");
    } else if (!participation) {
      throw new Error("Not authorized");
    }

    // Get all participants
    const allParticipants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", (args.conversationId as any)))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(1000);

    // Get participant user details
    const participantsWithUsers = await Promise.all(
      allParticipants.map(async (p) => {
        const user = await ctx.db.get(p.userId);
        return { ...p, user };
      })
    );

    return {
      ...conversation,
      participants: participantsWithUsers,
    };
  },
});

// Create new conversation
export const createConversation = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.union(v.literal("personal"), v.literal("group"), v.literal("ai")),
    name: v.optional(v.string()),
    participantIds: v.array(v.id("users")),
    metadata: v.optional(v.object({
      description: v.optional(v.string()),
      avatar: v.optional(v.string()),
      aiModel: v.optional(v.string()),
      systemPrompt: v.optional(v.string()),
      isFavorite: v.optional(v.boolean()),
      isPinned: v.optional(v.boolean()),
      isMuted: v.optional(v.boolean()),
      labels: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    await requirePermission(ctx, args.workspaceId, PERMS.CREATE_CONVERSATIONS);

    // For personal chats, verify the other user is either a Contact or a workspace member
    if (args.type === "personal" && args.participantIds.length === 1) {
      const otherUserId = args.participantIds[0];

      // Check if they are Contacts
      const Contactship = await ctx.db
        .query("socialContacts")
        .withIndex("by_users", (q) => q.eq("user1Id", userId).eq("user2Id", otherUserId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();

      const reverseContactship = await ctx.db
        .query("socialContacts")
        .withIndex("by_users", (q) => q.eq("user1Id", otherUserId).eq("user2Id", userId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .first();

      // Check if they are workspace members (allows DMs between workspace members)
      const isWorkspaceMember = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_workspace_user", (q) =>
          q.eq("workspaceId", args.workspaceId).eq("userId", otherUserId)
        )
        .first();

      if (!Contactship && !reverseContactship && !isWorkspaceMember) {
        throw new Error("Can only create direct chats with Contacts or workspace members");
      }

      // Check if conversation already exists
      const existingConv = await ctx.db
        .query("conversations")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.eq(q.field("type"), "personal"))
        .take(1000);

      for (const conv of existingConv) {
        const participants = await ctx.db
          .query("conversationParticipants")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .take(1000);

        if (participants.length === 2) {
          const participantIds = participants.map(p => p.userId);
          if (participantIds.includes(userId) && participantIds.includes(otherUserId)) {
            return conv._id; // Return existing conversation
          }
        }
      }
    }

    // Create conversation
    const conversationId = await ctx.db.insert("conversations", {
      name: args.name,
      type: args.type,
      workspaceId: args.workspaceId,
      createdBy: userId,
      isActive: true,
      metadata: (args.type === "ai")
        ? {
          ...(args.metadata || {}),
          aiModel: args.metadata?.aiModel || "gpt-4.1-nano",
          systemPrompt: args.metadata?.systemPrompt || "You are a helpful assistant for this workspace.",
        }
        : args.metadata,
    });

    // Add creator as admin participant
    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId,
      role: "admin",
      joinedAt: Date.now(),
      isActive: true,
    });

    // Add other participants
    for (const participantId of args.participantIds) {
      if (participantId !== userId) {
        await ctx.db.insert("conversationParticipants", {
          conversationId,
          userId: participantId,
          role: "member",
          joinedAt: Date.now(),
          isActive: true,
        });
      }
    }

    // Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      actorUserId: userId,
      action: "conversation.created",
      resourceType: "conversations",
      resourceId: conversationId,
      metadata: {
        type: args.type,
        participantCount: args.participantIds.length + 1,
      },
    });

    return conversationId;
  },
});

// Create or get a global direct conversation with a Contact
export const createOrGetDirectGlobal = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    if (String(userId) === String(args.otherUserId)) {
      throw new Error("Cannot chat with yourself");
    }

    // Verify Contactship in either direction
    const Contactship = await ctx.db
      .query("socialContacts")
      .withIndex("by_users", (q) => q.eq("user1Id", userId).eq("user2Id", args.otherUserId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    const reverseContactship = await ctx.db
      .query("socialContacts")
      .withIndex("by_users", (q) => q.eq("user1Id", args.otherUserId).eq("user2Id", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
    if (!Contactship && !reverseContactship) {
      throw new Error("You can only start chats with Contacts");
    }

    // Check for existing global personal conv (bounded scan; conv type is small)
    const existing = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("type"), "personal"))
      .take(500);
    for (const conv of existing) {
      const c: any = conv;
      if (c.workspaceId) continue; // global only
      const parts = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_conversation", (q) => q.eq("conversationId", c._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .take(1000);
      if (parts.length === 2) {
        const ids = parts.map((p) => String(p.userId));
        if (ids.includes(String(userId)) && ids.includes(String(args.otherUserId))) {
          return conv._id;
        }
      }
    }

    // Create new conversation (global)
    const conversationId = await ctx.db.insert("conversations", {
      name: undefined,
      type: "personal",
      workspaceId: undefined,
      createdBy: userId,
      isActive: true,
      metadata: {},
    } as any);

    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId,
      role: "admin",
      joinedAt: Date.now(),
      isActive: true,
    });
    await ctx.db.insert("conversationParticipants", {
      conversationId,
      userId: args.otherUserId,
      role: "member",
      joinedAt: Date.now(),
      isActive: true,
    });

    return conversationId;
  },
});

// Leave a conversation
export const leaveConversation = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    const myParticipation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", currentUserId).eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!myParticipation) throw new Error("Not a participant");

    // Load all active participants
    const activeParticipants = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(1000);

    const otherParticipants = activeParticipants.filter(p => String(p.userId) !== String(currentUserId));

    if (myParticipation.role === "admin") {
      // If this admin is the last admin but others remain, promote the oldest member to admin
      const otherAdmins = otherParticipants.filter(p => p.role === "admin");
      if (otherAdmins.length === 0 && otherParticipants.length > 0) {
        const candidate = otherParticipants.sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0))[0];
        await ctx.db.patch(candidate._id, { role: "admin" });
      }
    }

    // Mark self inactive
    await ctx.db.patch(myParticipation._id, { isActive: false });

    // Audit log (only for workspace conversations)
    if (conversation.workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId: conversation.workspaceId,
        actorUserId: currentUserId,
        action: "conversation.left",
        resourceType: "conversations",
        resourceId: args.conversationId,
        metadata: {
          wasAdmin: myParticipation.role === "admin",
          remainingParticipants: otherParticipants.length,
        },
      });
    }

    // If now zero participants, optionally deactivate the conversation
    const remaining = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(1000);
    if (remaining.length === 0 && conversation.isActive) {
      await ctx.db.patch(args.conversationId, { isActive: false });
    }

    return args.conversationId;
  },
});

// Search conversations by name or participant name/email within a workspace
export const searchConversations = query({
  args: {
    workspaceId: v.id("workspaces"),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const qstr = (args.query || "").toLowerCase();
    const candidates = await resolveCandidateUserIds(ctx);
    if (candidates.length === 0) return [] as any;

    // Gather participations for any candidate ID
    const participationMap = new Map<string, any>();
    for (const idStr of candidates) {
      const rows = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user", (q) => q.eq("userId", idStr as any))
        .filter((q) => q.eq(q.field("isActive"), true))
        .take(1000);
      for (const r of rows) participationMap.set(String(r.conversationId), r);
    }

    // Load conversations and participants, then filter
    const convIds = Array.from(participationMap.keys());
    const convDocs = await Promise.all(convIds.map((cid) => ctx.db.get(cid as any)));
    const results: any[] = [];
    for (const conv of convDocs as any[]) {
      if (!conv || (conv as any).workspaceId !== args.workspaceId) continue;

      const parts = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_conversation", (q) => q.eq("conversationId", (conv._id as any)))
        .filter((q) => q.eq(q.field("isActive"), true))
        .take(1000);
      const users = await Promise.all(parts.map(p => ctx.db.get(p.userId)));

      const nameMatch = ((conv as any).name || "").toLowerCase().includes(qstr);
      const participantMatch = users.some(u =>
        (u?.name || "").toLowerCase().includes(qstr) || (u?.email || "").toLowerCase().includes(qstr)
      );
      if (!nameMatch && !participantMatch) continue;

      // Compute last message and unread count similar to getWorkspaceConversations
      const lastMessage = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) => q.eq("conversationId", (conv._id as any)))
        .filter((q) => q.eq(q.field("deletedAt"), undefined))
        .order("desc")
        .first();
      let lastMessageWithSender = null as any;
      if (lastMessage) {
        const sender = await ctx.db.get(lastMessage.senderId);
        lastMessageWithSender = { ...lastMessage, senderName: sender?.name };
      }

      results.push({
        ...conv,
        participants: parts.map((p, idx) => ({ ...p, user: users[idx] })),
        lastMessage: lastMessageWithSender,
      });
      if (args.limit && results.length >= args.limit) break;
    }

    return results;
  },
});

// Update conversation
export const updateConversation = mutation({
  args: {
    conversationId: v.id("conversations"),
    name: v.optional(v.string()),
    metadata: v.optional(v.object({
      description: v.optional(v.string()),
      avatar: v.optional(v.string()),
      aiModel: v.optional(v.string()),
      systemPrompt: v.optional(v.string()),
      isFavorite: v.optional(v.boolean()),
      isPinned: v.optional(v.boolean()),
      isMuted: v.optional(v.boolean()),
      labels: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Check if user is participant
    const participation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", userId).eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!participation) throw new Error("Not authorized");

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.metadata !== undefined) updates.metadata = args.metadata;

    await ctx.db.patch(args.conversationId, updates);

    // Audit log (only for workspace conversations)
    if (conversation.workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId: conversation.workspaceId,
        actorUserId: userId,
        action: "conversation.updated",
        resourceType: "conversations",
        resourceId: args.conversationId,
        metadata: {
          nameChanged: args.name !== undefined,
          metadataChanged: args.metadata !== undefined,
        },
      });
    }

    return args.conversationId;
  },
});

// Mark conversation as read
export const markAsRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const candidateIds = await resolveCandidateUserIds(ctx);
    if (candidateIds.length === 0) throw new Error("Not authenticated");

    let participation: any = null;
    for (const idStr of candidateIds) {
      const p = await ctx.db
        .query("conversationParticipants")
        .withIndex("by_user_conversation", (q) =>
          q.eq("userId", idStr as any).eq("conversationId", args.conversationId)
        )
        .filter((q) => q.eq(q.field("isActive"), true))
        .unique();
      if (p) { participation = p; break; }
    }

    if (!participation) throw new Error("Not authorized");

    await ctx.db.patch(participation._id, {
      lastReadAt: Date.now(),
    });

    return args.conversationId;
  },
});

// Add participant to conversation
export const addParticipant = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Check if current user is admin
    const currentParticipation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", currentUserId).eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!currentParticipation || currentParticipation.role !== "admin") {
      throw new Error("Only admins can add participants");
    }

    // Check if user is already a participant
    const existingParticipation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (existingParticipation) {
      throw new Error("User is already a participant");
    }

    // Add participant
    const participantId = await ctx.db.insert("conversationParticipants", {
      conversationId: args.conversationId,
      userId: args.userId,
      role: "member",
      joinedAt: Date.now(),
      isActive: true,
    });

    // Audit log (only for workspace conversations)
    if (conversation.workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId: conversation.workspaceId,
        actorUserId: currentUserId,
        action: "conversationParticipant.added",
        resourceType: "conversationParticipants",
        resourceId: participantId,
        metadata: {
          conversationId: args.conversationId,
          addedUserId: args.userId,
        },
      });
    }

    return args.conversationId;
  },
});

// Remove participant from conversation
export const removeParticipant = mutation({
  args: {
    conversationId: v.id("conversations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await ensureUser(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) throw new Error("Conversation not found");

    // Check if current user is admin or removing themselves
    const currentParticipation = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", currentUserId).eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!currentParticipation) throw new Error("Not authorized");

    if (currentParticipation.role !== "admin" && args.userId !== currentUserId) {
      throw new Error("Only admins can remove other participants");
    }

    // Find participant to remove
    const participationToRemove = await ctx.db
      .query("conversationParticipants")
      .withIndex("by_user_conversation", (q) =>
        q.eq("userId", args.userId).eq("conversationId", args.conversationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .unique();

    if (!participationToRemove) {
      throw new Error("User is not a participant");
    }

    // Mark as inactive instead of deleting
    await ctx.db.patch(participationToRemove._id, {
      isActive: false,
    });

    // Audit log (only for workspace conversations)
    if (conversation.workspaceId) {
      await logAuditEvent(ctx, {
        workspaceId: conversation.workspaceId,
        actorUserId: currentUserId,
        action: "conversationParticipant.removed",
        resourceType: "conversationParticipants",
        resourceId: participationToRemove._id,
        metadata: {
          conversationId: args.conversationId,
          removedUserId: args.userId,
        },
      });
    }

    return args.conversationId;
  },
});
