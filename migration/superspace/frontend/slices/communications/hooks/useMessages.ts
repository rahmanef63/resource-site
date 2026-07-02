/**
 * Message Hooks
 * 
 * Hooks for fetching and managing messages, threads, and typing indicators.
 * Wired to the existing Convex chat backend.
 * 
 * @module features/communications/hooks
 */

"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { Message, Thread, TypingIndicator } from "../shared"

interface UseMessagesOptions {
  channelId?: Id<"channels"> | string
  limit?: number
  cursor?: string
}

/**
 * Check if an ID looks like a valid Convex ID (not a mock/sample ID)
 */
function isValidConvexId(id: string | undefined): boolean {
  if (!id) return false
  const mockPrefixes = ["ch-", "dm-", "user-", "msg-", "cat-", "bot-", "part-"]
  return !mockPrefixes.some(prefix => id.startsWith(prefix))
}

/**
 * Fetch messages for a channel with pagination
 * Uses the existing chat messages API
 * Only queries backend if the ID looks like a valid Convex ID
 */
export function useMessages(options: UseMessagesOptions = {}) {
  // Skip backend query for mock/sample IDs
  const shouldQuery = options.channelId && isValidConvexId(options.channelId)

  // Use getConversationMessages - channels are just conversations
  const rawMessages = useQuery(
    api.features.chat.messages.getConversationMessages,
    shouldQuery
      ? {
        conversationId: options.channelId as Id<"conversations">,
        limit: options.limit || 50,
      }
      : "skip"
  )

  const isLoading = rawMessages === undefined && !!options.channelId

  // Map backend messages to frontend Message type
  const messages: Message[] = (rawMessages ?? []).map((m: any): Message => ({
    id: m._id,
    channelId: m.conversationId,
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
    messages,
    hasMore: false, // TODO: Implement pagination
    nextCursor: null,
    isLoading,
    error: null,
  }
}

interface UseThreadMessagesOptions {
  threadId?: Id<"channelThreads">
  limit?: number
  cursor?: string
}

/**
 * Fetch messages for a thread with pagination
 */
export function useThreadMessages(options: UseThreadMessagesOptions = {}) {
  // TODO: Implement Convex query when backend is ready
  // const result = useQuery(
  //   api.features.communications.threads.messages,
  //   options.threadId ? { 
  //     threadId: options.threadId,
  //     limit: options.limit || 50,
  //     cursor: options.cursor,
  //   } : "skip"
  // )

  const messages: Message[] = []
  const thread: Thread | null = null
  const hasMore = false
  const nextCursor: string | null = null
  const isLoading = false
  const error = null

  return {
    messages,
    thread,
    hasMore,
    nextCursor,
    isLoading,
    error,
  }
}

interface UseTypingIndicatorsOptions {
  channelId?: Id<"channels">
  directConversationId?: Id<"directConversations">
}

/**
 * Subscribe to typing indicators for a channel or DM
 */
export function useTypingIndicators(options: UseTypingIndicatorsOptions = {}) {
  // TODO: Implement Convex query when backend is ready
  // const indicators = useQuery(
  //   api.features.communications.typing.list,
  //   options.channelId || options.directConversationId ? {
  //     channelId: options.channelId,
  //     directConversationId: options.directConversationId,
  //   } : "skip"
  // )

  const typingUsers: TypingIndicator[] = []
  const isLoading = false
  const error = null

  return {
    typingUsers,
    isLoading,
    error,
  }
}

/**
 * Message mutation hooks
 * Uses existing chat.messages API
 */
export function useMessageMutations() {
  const sendMessageMut = useMutation(api.features.chat.messages.sendMessage)
  const editMessageMut = useMutation(api.features.chat.messages.editMessage)
  const deleteMessageMut = useMutation(api.features.chat.messages.deleteMessage)

  return {
    sendMessage: async (data: {
      channelId?: Id<"channels"> | string
      directConversationId?: Id<"directConversations">
      threadId?: Id<"channelThreads">
      content: string
      type?: Message["type"]
      attachments?: Message["attachments"]
      mentions?: Message["mentions"]
    }) => {
      // Use channelId or directConversationId as conversationId
      const conversationId = (data.channelId || data.directConversationId) as Id<"conversations">
      if (!conversationId) {
        console.error("No conversation ID provided")
        return
      }
      return await sendMessageMut({
        conversationId,
        content: data.content,
        replyToId: data.threadId as Id<"messages"> | undefined,
      })
    },

    editMessage: async (messageId: Id<"channelMessages"> | string, content: string) => {
      return await editMessageMut({
        messageId: messageId as Id<"messages">,
        content,
      })
    },

    deleteMessage: async (messageId: Id<"channelMessages"> | string) => {
      return await deleteMessageMut({
        messageId: messageId as Id<"messages">,
      })
    },

    addReaction: async (_messageId: Id<"channelMessages">, _emoji: string) => {
      // TODO: Implement reaction logic
    },
  }
}

export default useMessages
