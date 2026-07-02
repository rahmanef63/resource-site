/**
 * Channel Hooks
 * 
 * Hooks for fetching and managing channels, categories, members, and roles.
 * Wired to the existing Convex chat backend (channels are conversations with type="channel").
 * 
 * @module features/communications/hooks
 */

"use client"

import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type {
  Channel,
  ChannelCategory,
  ChannelMembership,
  ChannelRole,
} from "../shared"

interface UseChannelsOptions {
  workspaceId?: Id<"workspaces">
  categoryId?: Id<"channelCategories">
  type?: Channel["type"]
}

/**
 * Fetch channels for a workspace with optional filters
 * Maps backend "conversations" with type="channel" to frontend Channel type
 */
export function useChannels(options: UseChannelsOptions = {}) {
  // Use workspace conversations and filter for channel types
  const rawConversations = useQuery(
    api.features.chat.conversations.getWorkspaceConversations,
    options.workspaceId ? { workspaceId: options.workspaceId } : "skip"
  )

  const isLoading = rawConversations === undefined && !!options.workspaceId

  // Map backend conversation type to frontend Channel type
  // Channels are conversations with type="channel" or "group"
  const channels: Channel[] = (rawConversations ?? [])
    .filter((c: any) => c.type === "channel" || c.type === "group")
    .map((c: any): Channel => ({
      id: c._id,
      workspaceId: c.workspaceId,
      name: c.name || "Unnamed Channel",
      type: "text" as const, // Default to text channel
      topic: c.description || "",
      description: c.description,
      isPrivate: c.isPrivate || false,
      categoryId: c.categoryId,
      position: c.position || 0,
    }))

  return {
    channels,
    isLoading,
    error: null,
  }
}

/**
 * Check if an ID looks like a valid Convex ID (not a mock/sample ID)
 * Convex IDs are longer and don't start with common prefixes like "ch-", "dm-", etc.
 */
function isValidConvexId(id: string | undefined): boolean {
  if (!id) return false
  // Mock IDs typically start with prefixes like "ch-", "dm-", "user-", etc.
  const mockPrefixes = ["ch-", "dm-", "user-", "msg-", "cat-", "bot-", "part-"]
  return !mockPrefixes.some(prefix => id.startsWith(prefix))
}

/**
 * Fetch a single channel by ID
 * Uses the conversation API
 * Only queries backend if the ID looks like a valid Convex ID
 */
export function useChannel(channelId?: Id<"channels"> | string) {
  // Skip backend query for mock/sample IDs
  const shouldQuery = channelId && isValidConvexId(channelId)

  // Use getConversation to fetch channel details
  const conversation = useQuery(
    api.features.chat.conversations.getConversation,
    shouldQuery ? { conversationId: channelId as Id<"conversations"> } : "skip"
  )

  const isLoading = conversation === undefined && !!channelId

  // Map to Channel type
  const channel: Channel | null = conversation ? {
    id: conversation._id,
    workspaceId: conversation.workspaceId || "",
    name: conversation.name || "Unnamed Channel",
    type: "text" as const,
    topic: (conversation as any).description || "",
    description: (conversation as any).description,
    isPrivate: (conversation as any).isPrivate || false,
    categoryId: (conversation as any).categoryId,
    position: (conversation as any).position || 0,
  } : null

  return {
    channel,
    isLoading,
    error: null,
  }
}

interface UseChannelCategoriesOptions {
  workspaceId?: Id<"workspaces">
}

/**
 * Fetch channel categories for a workspace
 */
export function useChannelCategories(options: UseChannelCategoriesOptions = {}) {
  // TODO: Implement Convex query when backend is ready
  // const categories = useQuery(api.features.communications.categories.list, {
  //   workspaceId: options.workspaceId,
  // })

  const categories: ChannelCategory[] = []
  const isLoading = false
  const error = null

  return {
    categories,
    isLoading,
    error,
  }
}

interface UseChannelMembersOptions {
  channelId?: Id<"channels">
  roleId?: Id<"channelRoles">
}

/**
 * Fetch members of a channel with optional role filter
 */
export function useChannelMembers(options: UseChannelMembersOptions = {}) {
  // TODO: Implement Convex query when backend is ready
  // const members = useQuery(
  //   api.features.communications.members.list,
  //   options.channelId ? { channelId: options.channelId, roleId: options.roleId } : "skip"
  // )

  const members: ChannelMembership[] = []
  const isLoading = false
  const error = null

  return {
    members,
    isLoading,
    error,
  }
}

interface UseChannelRolesOptions {
  channelId?: Id<"channels">
}

/**
 * Fetch roles for a channel
 */
export function useChannelRoles(options: UseChannelRolesOptions = {}) {
  // TODO: Implement Convex query when backend is ready
  // const roles = useQuery(
  //   api.features.communications.roles.list,
  //   options.channelId ? { channelId: options.channelId } : "skip"
  // )

  const roles: ChannelRole[] = []
  const isLoading = false
  const error = null

  return {
    roles,
    isLoading,
    error,
  }
}

/**
 * Channel mutation hooks
 * Uses existing chat conversation/message APIs
 */
export function useChannelMutations() {
  const createConversation = useMutation(api.features.chat.conversations.createConversation)
  const updateConversation = useMutation(api.features.chat.conversations.updateConversation)

  return {
    createChannel: async (data: {
      workspaceId: Id<"workspaces">
      name: string
      description?: string
      isPrivate?: boolean
    }) => {
      return await createConversation({
        workspaceId: data.workspaceId,
        type: "group", // Use "group" type for channels (backend supports: personal, group, ai)
        name: data.name,
        participantIds: [], // Channels start empty, members join
      })
    },
    updateChannel: async (channelId: Id<"channels"> | string, data: Partial<Channel>) => {
      await updateConversation({
        conversationId: channelId as Id<"conversations">,
        name: data.name,
      })
    },
    deleteChannel: async (channelId: Id<"channels">) => {
      // Note: Delete mutation would need to be added to backend
    },
  }
}

export default useChannels
