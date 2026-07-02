/**
 * Communications Hook
 * 
 * Main hook for the Communications feature integrating with Convex.
 * 
 * Pattern: Use Convex query directly, no manual loading state
 * The query returns undefined while loading, data when ready
 * 
 * @see docs/00_BASE_KNOWLEDGE.md - Pattern 4: React Component with Convex
 * @module features/communications/hooks
 */

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Main hook for Communications feature
 * 
 * Provides unified access to channels, conversations, calls, and related data
 */
export function useCommunications(workspaceId: Id<"workspaces"> | null | undefined) {
  // Query conversations (channels and DMs)
  const conversations = useQuery(
    api.features.chat.conversations.getWorkspaceConversations,
    workspaceId ? { workspaceId } : "skip"
  )

  // Query calls
  const calls = useQuery(
    api.features.calls.queries.getWorkspaceCalls,
    workspaceId ? { workspaceId } : "skip"
  )

  // Mutations for conversations
  const createConversation = useMutation(api.features.chat.conversations.createConversation)
  const updateConversation = useMutation(api.features.chat.conversations.updateConversation)

  // Mutations for messages
  const sendMessage = useMutation(api.features.chat.messages.sendMessage)
  const deleteMessage = useMutation(api.features.chat.messages.deleteMessage)
  const editMessage = useMutation(api.features.chat.messages.editMessage)

  // Mutations for calls - using actual API names
  const createCall = useMutation(api.features.calls.mutations.createCall)
  const updateCallStatus = useMutation(api.features.calls.mutations.updateCallStatus)

  return {
    // Loading state
    isLoading: (conversations === undefined || calls === undefined) &&
      workspaceId !== null && workspaceId !== undefined,

    // Data
    conversations: conversations ?? [],
    calls: calls ?? [],

    // Conversation actions
    createConversation,
    updateConversation,

    // Message actions
    sendMessage,
    deleteMessage,
    editMessage,

    // Call actions - mapped to correct API
    createCall,
    updateCallStatus,
    // Convenience wrappers
    startCall: createCall,
    endCall: async (args: { callId: Id<"calls"> }) =>
      updateCallStatus({ callId: args.callId, status: "ended" }),
    declineCall: async (args: { callId: Id<"calls"> }) =>
      updateCallStatus({ callId: args.callId, status: "declined" }),
    answerCall: async (args: { callId: Id<"calls"> }) =>
      updateCallStatus({ callId: args.callId, status: "ongoing" }),
  }
}

/**
 * Hook for getting a single conversation with messages
 */
export function useConversation(
  conversationId: Id<"conversations"> | null | undefined
) {
  // getConversation only requires conversationId per the API
  const conversation = useQuery(
    api.features.chat.conversations.getConversation,
    conversationId ? { conversationId } : "skip"
  )

  // getConversationMessages is the actual API name
  const messages = useQuery(
    api.features.chat.messages.getConversationMessages,
    conversationId ? { conversationId, limit: 50 } : "skip"
  )

  return {
    isLoading: (conversation === undefined || messages === undefined) &&
      conversationId !== null && conversationId !== undefined,
    conversation,
    messages: messages ?? [],
  }
}

/**
 * Hook for call-specific functionality
 */
export function useCall(callId: Id<"calls"> | null | undefined) {
  const call = useQuery(
    api.features.calls.queries.getCall,
    callId ? { callId } : "skip"
  )

  const updateCallStatus = useMutation(api.features.calls.mutations.updateCallStatus)

  return {
    isLoading: call === undefined && callId !== null && callId !== undefined,
    call,
    updateCallStatus,
    // Convenience methods
    endCall: async () => {
      if (callId) await updateCallStatus({ callId, status: "ended" })
    },
    muteToggle: async () => {
      // Note: mute/video toggle would need a separate participant update mutation
      // implementation pending
    }
  }
}

export default useCommunications
