/**
 * Direct Message Hooks
 * 
 * Hooks for fetching and managing direct conversations and messages.
 * Wired to the existing Convex chat backend.
 * 
 * @module features/communications/hooks
 */

"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { DirectConversation, DirectParticipant, Message } from "../shared"

interface UseDirectConversationsOptions {
  workspaceId?: Id<"workspaces">
}

/**
 * Fetch direct conversations for the current user
 * Maps backend "conversations" to frontend "DirectConversation" type
 */
export function useDirectConversations(options: UseDirectConversationsOptions = {}) {
  // Use workspace conversations if workspaceId provided, otherwise global
  const workspaceConversations = useQuery(
    api.features.chat.conversations.getWorkspaceConversations,
    options.workspaceId ? { workspaceId: options.workspaceId } : "skip"
  )

  const globalConversations = useQuery(
    api.features.chat.conversations.getGlobalConversations,
    options.workspaceId ? "skip" : {}
  )

  const rawConversations = options.workspaceId ? workspaceConversations : globalConversations
  const isLoading = rawConversations === undefined

  // Map backend conversation type to frontend DirectConversation type
  const conversations: DirectConversation[] = (rawConversations ?? [])
    .filter((c: any) => c.type === "personal") // Only DMs, not group/ai
    .map((c: any): DirectConversation => ({
      id: c._id,
      workspaceId: c.workspaceId,
      type: "direct",
      name: c.name,
      participants: (c.participants ?? []).map((p: any): DirectParticipant => ({
        id: p._id,
        conversationId: c._id,
        userId: p.userId,
        user: p.user ? {
          id: p.user._id,
          name: p.user.name || p.user.email || "Unknown",
          avatar: p.user.imageUrl || p.user.image,
          status: "online", // TODO: integrate presence
        } : undefined,
        joinedAt: new Date(p.joinedAt || Date.now()).toISOString(),
      })),
      participantIds: (c.participants ?? []).map((p: any) => p.userId),
      lastMessage: c.lastMessage ? {
        id: c.lastMessage._id,
        conversationId: c._id,
        senderId: c.lastMessage.senderId,
        senderType: "user",
        content: c.lastMessage.content,
        type: c.lastMessage.type || "text",
        createdAt: new Date(c.lastMessage._creationTime || Date.now()).toISOString(),
        timestamp: new Date(c.lastMessage._creationTime || Date.now()).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      } : undefined,
      lastMessageAt: c.lastMessage?._creationTime
        ? new Date(c.lastMessage._creationTime).toISOString()
        : undefined,
      unreadCount: c.unreadCount || 0,
      createdBy: c.createdBy,
      createdAt: new Date(c._creationTime || Date.now()).toISOString(),
    }))

  return {
    conversations,
    isLoading,
    error: null,
  }
}

/**
 * Check if an ID looks like a valid Convex ID (not a mock/sample ID)
 */
function isValidConvexId(id: string | undefined): boolean {
  if (!id) return false
  const mockPrefixes = ["ch-", "dm-", "user-", "msg-", "cat-", "bot-", "part-", "ai-"]
  return !mockPrefixes.some(prefix => id.startsWith(prefix))
}

interface UseDirectConversationOptions {
  conversationId?: string
}

/**
 * Fetch a single direct conversation by ID
 * Maps backend "conversation" to frontend "DirectConversation" type
 */
export function useDirectConversation(options: UseDirectConversationOptions = {}) {
  // Skip backend query for mock/sample IDs
  const shouldQuery = options.conversationId && isValidConvexId(options.conversationId)

  const conversation = useQuery(
    api.features.chat.conversations.getConversation,
    shouldQuery ? { conversationId: options.conversationId as Id<"conversations"> } : "skip"
  )

  const isLoading = conversation === undefined && !!options.conversationId

  // Map to DirectConversation type
  const directConversation: DirectConversation | null = conversation ? {
    id: conversation._id,
    workspaceId: conversation.workspaceId,
    type: "direct",
    name: conversation.name,
    participants: ((conversation as any).participants ?? []).map((p: any): DirectParticipant => ({
      id: p._id,
      conversationId: conversation._id,
      userId: p.userId,
      user: p.user ? {
        id: p.user._id,
        name: p.user.name || p.user.email || "Unknown",
        avatar: p.user.imageUrl || p.user.image,
        status: "online" as const,
      } : undefined,
      joinedAt: new Date(p.joinedAt || Date.now()).toISOString(),
    })),
    participantIds: ((conversation as any).participants ?? []).map((p: any) => p.userId),
    createdBy: conversation.createdBy,
    createdAt: new Date((conversation as any)._creationTime || Date.now()).toISOString(),
  } : null

  return {
    conversation: directConversation,
    isLoading,
    error: null,
  }
}

interface UseDirectMessagesOptions {
  conversationId?: string
  limit?: number
}

/**
 * Fetch messages for a direct conversation with pagination
 */
export function useDirectMessages(options: UseDirectMessagesOptions = {}) {
  const messages = useQuery(
    api.features.chat.messages.getConversationMessages,
    options.conversationId
      ? {
        conversationId: options.conversationId as Id<"conversations">,
        limit: options.limit || 50
      }
      : "skip"
  )

  const isLoading = messages === undefined && !!options.conversationId

  // Map backend messages to frontend Message type
  const mappedMessages: Message[] = (messages ?? []).map((m: any): Message => ({
    id: m._id,
    channelId: m.conversationId, // Using channelId for compatibility with MessageItem
    senderId: m.senderId,
    senderType: m.metadata?.aiModel ? "ai" : "user",
    sender: m.sender ? {
      id: m.sender._id,
      name: m.sender.name || m.sender.email || "Unknown",
      avatar: m.sender.imageUrl || m.sender.image,
    } : undefined,
    content: m.content,
    type: m.type || "text",
    createdAt: new Date(m._creationTime || Date.now()).toISOString(),
    timestamp: new Date(m._creationTime || Date.now()).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isEdited: !!m.editedAt,
    editedAt: m.editedAt ? new Date(m.editedAt).toISOString() : undefined,
    reactions: m.reactions || [],
    replyToId: m.replyToId,
  }))

  return {
    messages: mappedMessages,
    hasMore: false, // TODO: implement pagination
    nextCursor: null,
    isLoading,
    error: null,
  }
}

/**
 * Direct message mutation hooks
 */
export function useDirectMessageMutations() {
  const createConversationMut = useMutation(api.features.chat.conversations.createConversation)
  const createOrGetDirectGlobal = useMutation(api.features.chat.conversations.createOrGetDirectGlobal)
  const sendMessageMut = useMutation(api.features.chat.messages.sendMessage)
  const markAsReadMut = useMutation(api.features.chat.conversations.markAsRead)

  return {
    /**
     * Start or get a direct conversation with one or more users
     */
    createConversation: async (data: {
      participantIds: Id<"users">[]
      workspaceId?: Id<"workspaces">
      name?: string
    }) => {
      // For 1:1 DMs without workspace, use createOrGetDirectGlobal
      if (data.participantIds.length === 1 && !data.workspaceId) {
        return await createOrGetDirectGlobal({ otherUserId: data.participantIds[0] })
      }

      // For workspace DMs or group DMs, use createConversation
      if (data.workspaceId) {
        return await createConversationMut({
          workspaceId: data.workspaceId,
          type: data.participantIds.length === 1 ? "personal" : "group",
          name: data.name,
          participantIds: data.participantIds,
        })
      }

      // Fallback for global 1:1
      return await createOrGetDirectGlobal({ otherUserId: data.participantIds[0] })
    },

    /**
     * Send a message in a direct conversation
     */
    sendMessage: async (data: {
      conversationId: string
      content: string
      type?: "text" | "image" | "file"
      replyToId?: string
    }) => {
      return await sendMessageMut({
        conversationId: data.conversationId as Id<"conversations">,
        content: data.content,
        type: data.type,
        replyToId: data.replyToId as Id<"messages"> | undefined,
      })
    },

    /**
     * Mark a conversation as read
     */
    markAsRead: async (conversationId: string) => {
      return await markAsReadMut({
        conversationId: conversationId as Id<"conversations">
      })
    },

    /**
     * Archive a conversation (not yet implemented in backend)
     */
    archiveConversation: async (conversationId: string) => {
    }
  }
}

export default useDirectConversations

