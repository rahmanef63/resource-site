/**
 * Communications Store
 * 
 * Zustand store for managing communication state:
 * - Channels, messages, threads
 * - Calls, screen sharing
 * - Presence, typing indicators
 * - AI bots
 * 
 * @module features/communications/shared/stores
 */

import { create } from "zustand"
import { devtools, subscribeWithSelector } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"
import type {
  Channel,
  ChannelCategory,
  Message,
  Thread,
  Call,
  CallParticipant,
  ScreenShare,
  DirectConversation,
  DirectMessage,
  UserPresence,
  TypingIndicator,
  AIBot,
  ChannelMembership,
  ChannelPermissions,
} from "../types"

// =============================================================================
// STATE TYPES
// =============================================================================

interface ChannelState {
  categories: ChannelCategory[]
  channels: Channel[]
  selectedChannelId: string | null
  channelMessages: Record<string, Message[]>
  channelMemberships: Record<string, ChannelMembership>
}

interface ThreadState {
  threads: Record<string, Thread[]> // channelId -> threads
  selectedThreadId: string | null
  threadMessages: Record<string, Message[]> // threadId -> messages
}

interface CallState {
  activeCall: Call | null
  participants: CallParticipant[]
  screenShares: ScreenShare[]
  localMediaState: {
    isMuted: boolean
    isDeafened: boolean
    isVideoOn: boolean
    isScreenSharing: boolean
  }
  callHistory: Call[]
}

interface DirectState {
  conversations: DirectConversation[]
  selectedConversationId: string | null
  conversationMessages: Record<string, DirectMessage[]>
}

interface PresenceState {
  presenceMap: Record<string, UserPresence> // userId -> presence
  typingIndicators: Record<string, TypingIndicator[]> // channelId/convId -> typing users
}

interface AIState {
  bots: AIBot[]
  channelBots: Record<string, AIBot[]> // channelId -> bots
}

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean
  activeSidebarTab: "channels" | "dms" | "calls" | "ai"

  // Panels
  rightPanelOpen: boolean
  rightPanelContent: "members" | "details" | "threads" | "search" | "ai" | null

  // Modals
  activeModal: string | null
  modalData: Record<string, unknown>

  // View mode
  viewMode: "channel" | "thread" | "call" | "dm"

  // Communications-specific workspace (separate from main app workspace)
  communicationWorkspaceId: string | null

  // Privacy toggles
  isPrivateMode: boolean // Global private mode for all communications
  isPrivateDMs: boolean  // Private mode specifically for DMs
}

interface CommunicationsState {
  // Sub-states
  channel: ChannelState
  thread: ThreadState
  call: CallState
  direct: DirectState
  presence: PresenceState
  ai: AIState
  ui: UIState

  // Actions - Channels
  setCategories: (categories: ChannelCategory[]) => void
  setChannels: (channels: Channel[]) => void
  selectChannel: (channelId: string | null) => void
  updateChannel: (channelId: string, updates: Partial<Channel>) => void
  addChannel: (channel: Channel) => void
  removeChannel: (channelId: string) => void

  // Actions - Messages
  setChannelMessages: (channelId: string, messages: Message[]) => void
  addMessage: (channelId: string, message: Message) => void
  updateMessage: (channelId: string, messageId: string, updates: Partial<Message>) => void
  deleteMessage: (channelId: string, messageId: string) => void

  // Actions - Threads
  setThreads: (channelId: string, threads: Thread[]) => void
  selectThread: (threadId: string | null) => void
  setThreadMessages: (threadId: string, messages: Message[]) => void
  addThreadMessage: (threadId: string, message: Message) => void

  // Actions - Calls
  setActiveCall: (call: Call | null) => void
  updateCallParticipants: (participants: CallParticipant[]) => void
  updateLocalMediaState: (updates: Partial<CallState["localMediaState"]>) => void
  addScreenShare: (share: ScreenShare) => void
  removeScreenShare: (shareId: string) => void

  // Actions - Direct Messages
  setDirectConversations: (conversations: DirectConversation[]) => void
  addDirectConversation: (conversation: DirectConversation) => void
  selectDirectConversation: (conversationId: string | null) => void
  setDirectMessages: (conversationId: string, messages: DirectMessage[]) => void
  addDirectMessage: (conversationId: string, message: DirectMessage) => void

  // Actions - Presence
  updatePresence: (userId: string, presence: UserPresence) => void
  setTypingIndicators: (key: string, indicators: TypingIndicator[]) => void
  addTypingIndicator: (key: string, indicator: TypingIndicator) => void
  removeTypingIndicator: (key: string, userId: string) => void

  // Actions - AI
  setBots: (bots: AIBot[]) => void
  setChannelBots: (channelId: string, bots: AIBot[]) => void

  // Actions - UI
  toggleSidebar: () => void
  setSidebarTab: (tab: UIState["activeSidebarTab"]) => void
  toggleRightPanel: () => void
  setRightPanelContent: (content: UIState["rightPanelContent"]) => void
  openModal: (modalId: string, data?: Record<string, unknown>) => void
  closeModal: () => void
  setViewMode: (mode: UIState["viewMode"]) => void

  // Workspace & Privacy
  setCommunicationWorkspace: (workspaceId: string | null) => void
  togglePrivateMode: () => void
  togglePrivateDMs: () => void
  setPrivateMode: (isPrivate: boolean) => void
  setPrivateDMs: (isPrivate: boolean) => void

  // Membership
  setChannelMembership: (channelId: string, membership: ChannelMembership) => void
  getUserPermissions: (channelId: string) => ChannelPermissions | null

  // Reset
  reset: () => void
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialChannelState: ChannelState = {
  categories: [],
  channels: [],
  selectedChannelId: null,
  channelMessages: {},
  channelMemberships: {},
}

const initialThreadState: ThreadState = {
  threads: {},
  selectedThreadId: null,
  threadMessages: {},
}

const initialCallState: CallState = {
  activeCall: null,
  participants: [],
  screenShares: [],
  localMediaState: {
    isMuted: false,
    isDeafened: false,
    isVideoOn: false,
    isScreenSharing: false,
  },
  callHistory: [],
}

const initialDirectState: DirectState = {
  conversations: [],
  selectedConversationId: null,
  conversationMessages: {},
}

const initialPresenceState: PresenceState = {
  presenceMap: {},
  typingIndicators: {},
}

const initialAIState: AIState = {
  bots: [],
  channelBots: {},
}

const initialUIState: UIState = {
  sidebarCollapsed: false,
  activeSidebarTab: "channels",
  rightPanelOpen: false,
  rightPanelContent: null,
  activeModal: null,
  modalData: {},
  viewMode: "channel",
  communicationWorkspaceId: null,
  isPrivateMode: false,
  isPrivateDMs: false,
}

// =============================================================================
// STORE
// =============================================================================

export const useCommunicationsStore = create<CommunicationsState>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        channel: initialChannelState,
        thread: initialThreadState,
        call: initialCallState,
        direct: initialDirectState,
        presence: initialPresenceState,
        ai: initialAIState,
        ui: initialUIState,

        // ==========================================================
        // Channel Actions
        // ==========================================================

        setCategories: (categories) =>
          set((state) => {
            state.channel.categories = categories
          }),

        setChannels: (channels) =>
          set((state) => {
            state.channel.channels = channels
          }),

        selectChannel: (channelId) =>
          set((state) => {
            state.channel.selectedChannelId = channelId
            state.thread.selectedThreadId = null
            state.ui.viewMode = "channel"
          }),

        updateChannel: (channelId, updates) =>
          set((state) => {
            const index = state.channel.channels.findIndex((c) => c.id === channelId)
            if (index !== -1) {
              Object.assign(state.channel.channels[index], updates)
            }
          }),

        addChannel: (channel) =>
          set((state) => {
            state.channel.channels.push(channel)
          }),

        removeChannel: (channelId) =>
          set((state) => {
            state.channel.channels = state.channel.channels.filter((c) => c.id !== channelId)
            if (state.channel.selectedChannelId === channelId) {
              state.channel.selectedChannelId = null
            }
          }),

        // ==========================================================
        // Message Actions
        // ==========================================================

        setChannelMessages: (channelId, messages) =>
          set((state) => {
            state.channel.channelMessages[channelId] = messages
          }),

        addMessage: (channelId, message) =>
          set((state) => {
            if (!state.channel.channelMessages[channelId]) {
              state.channel.channelMessages[channelId] = []
            }
            state.channel.channelMessages[channelId].push(message)
          }),

        updateMessage: (channelId, messageId, updates) =>
          set((state) => {
            const messages = state.channel.channelMessages[channelId]
            if (messages) {
              const index = messages.findIndex((m) => m.id === messageId)
              if (index !== -1) {
                Object.assign(messages[index], updates)
              }
            }
          }),

        deleteMessage: (channelId, messageId) =>
          set((state) => {
            const messages = state.channel.channelMessages[channelId]
            if (messages) {
              state.channel.channelMessages[channelId] = messages.filter(
                (m) => m.id !== messageId
              )
            }
          }),

        // ==========================================================
        // Thread Actions
        // ==========================================================

        setThreads: (channelId, threads) =>
          set((state) => {
            state.thread.threads[channelId] = threads
          }),

        selectThread: (threadId) =>
          set((state) => {
            state.thread.selectedThreadId = threadId
            state.ui.viewMode = threadId ? "thread" : "channel"
          }),

        setThreadMessages: (threadId, messages) =>
          set((state) => {
            state.thread.threadMessages[threadId] = messages
          }),

        addThreadMessage: (threadId, message) =>
          set((state) => {
            if (!state.thread.threadMessages[threadId]) {
              state.thread.threadMessages[threadId] = []
            }
            state.thread.threadMessages[threadId].push(message)
          }),

        // ==========================================================
        // Call Actions
        // ==========================================================

        setActiveCall: (call) =>
          set((state) => {
            state.call.activeCall = call
            if (call) {
              state.ui.viewMode = "call"
            }
          }),

        updateCallParticipants: (participants) =>
          set((state) => {
            state.call.participants = participants
          }),

        updateLocalMediaState: (updates) =>
          set((state) => {
            Object.assign(state.call.localMediaState, updates)
          }),

        addScreenShare: (share) =>
          set((state) => {
            state.call.screenShares.push(share)
          }),

        removeScreenShare: (shareId) =>
          set((state) => {
            state.call.screenShares = state.call.screenShares.filter(
              (s) => s.id !== shareId
            )
          }),

        // ==========================================================
        // Direct Message Actions
        // ==========================================================

        setDirectConversations: (conversations) =>
          set((state) => {
            state.direct.conversations = conversations
          }),

        addDirectConversation: (conversation) =>
          set((state) => {
            // Check if conversation already exists
            const exists = state.direct.conversations.some(c => c.id === conversation.id)
            if (!exists) {
              state.direct.conversations.unshift(conversation)
            }
          }),

        selectDirectConversation: (conversationId) =>
          set((state) => {
            state.direct.selectedConversationId = conversationId
            state.channel.selectedChannelId = null
            state.ui.viewMode = "dm"
          }),

        setDirectMessages: (conversationId, messages) =>
          set((state) => {
            state.direct.conversationMessages[conversationId] = messages
          }),

        addDirectMessage: (conversationId, message) =>
          set((state) => {
            if (!state.direct.conversationMessages[conversationId]) {
              state.direct.conversationMessages[conversationId] = []
            }
            state.direct.conversationMessages[conversationId].push(message)
          }),

        // ==========================================================
        // Presence Actions
        // ==========================================================

        updatePresence: (userId, presence) =>
          set((state) => {
            state.presence.presenceMap[userId] = presence
          }),

        setTypingIndicators: (key, indicators) =>
          set((state) => {
            state.presence.typingIndicators[key] = indicators
          }),

        addTypingIndicator: (key, indicator) =>
          set((state) => {
            if (!state.presence.typingIndicators[key]) {
              state.presence.typingIndicators[key] = []
            }
            const existing = state.presence.typingIndicators[key].findIndex(
              (t) => t.userId === indicator.userId
            )
            if (existing !== -1) {
              state.presence.typingIndicators[key][existing] = indicator
            } else {
              state.presence.typingIndicators[key].push(indicator)
            }
          }),

        removeTypingIndicator: (key, userId) =>
          set((state) => {
            if (state.presence.typingIndicators[key]) {
              state.presence.typingIndicators[key] = state.presence.typingIndicators[
                key
              ].filter((t) => t.userId !== userId)
            }
          }),

        // ==========================================================
        // AI Actions
        // ==========================================================

        setBots: (bots) =>
          set((state) => {
            state.ai.bots = bots
          }),

        setChannelBots: (channelId, bots) =>
          set((state) => {
            state.ai.channelBots[channelId] = bots
          }),

        // ==========================================================
        // UI Actions
        // ==========================================================

        toggleSidebar: () =>
          set((state) => {
            state.ui.sidebarCollapsed = !state.ui.sidebarCollapsed
          }),

        setSidebarTab: (tab) =>
          set((state) => {
            state.ui.activeSidebarTab = tab
          }),

        toggleRightPanel: () =>
          set((state) => {
            state.ui.rightPanelOpen = !state.ui.rightPanelOpen
          }),

        setRightPanelContent: (content) =>
          set((state) => {
            state.ui.rightPanelContent = content
            state.ui.rightPanelOpen = content !== null
          }),

        openModal: (modalId, data = {}) =>
          set((state) => {
            state.ui.activeModal = modalId
            state.ui.modalData = data
          }),

        closeModal: () =>
          set((state) => {
            state.ui.activeModal = null
            state.ui.modalData = {}
          }),

        setViewMode: (mode) =>
          set((state) => {
            state.ui.viewMode = mode
          }),

        // ==========================================================
        // Workspace & Privacy Actions
        // ==========================================================

        setCommunicationWorkspace: (workspaceId) =>
          set((state) => {
            state.ui.communicationWorkspaceId = workspaceId
            // Reset channel selection when switching workspaces
            state.channel.selectedChannelId = null
            state.direct.selectedConversationId = null
          }),

        togglePrivateMode: () =>
          set((state) => {
            state.ui.isPrivateMode = !state.ui.isPrivateMode
          }),

        togglePrivateDMs: () =>
          set((state) => {
            state.ui.isPrivateDMs = !state.ui.isPrivateDMs
          }),

        setPrivateMode: (isPrivate) =>
          set((state) => {
            state.ui.isPrivateMode = isPrivate
          }),

        setPrivateDMs: (isPrivate) =>
          set((state) => {
            state.ui.isPrivateDMs = isPrivate
          }),

        // ==========================================================
        // Membership
        // ==========================================================

        setChannelMembership: (channelId, membership) =>
          set((state) => {
            state.channel.channelMemberships[channelId] = membership
          }),

        getUserPermissions: (channelId) => {
          const membership = get().channel.channelMemberships[channelId]
          if (!membership) return null

          // Calculate from roles
          const channel = get().channel.channels.find((c) => c.id === channelId)
          return channel?.userPermissions ?? null
        },

        // ==========================================================
        // Reset
        // ==========================================================

        reset: () =>
          set((state) => {
            state.channel = initialChannelState
            state.thread = initialThreadState
            state.call = initialCallState
            state.direct = initialDirectState
            state.presence = initialPresenceState
            state.ai = initialAIState
            state.ui = initialUIState
          }),
      }))
    ),
    { name: "communications-store" }
  )
)

// =============================================================================
// SELECTORS (for optimized re-renders)
// =============================================================================

// Channel selectors
export const useChannels = () => useCommunicationsStore((s) => s.channel.channels)
export const useCategories = () => useCommunicationsStore((s) => s.channel.categories)
export const useSelectedChannelId = () => useCommunicationsStore((s) => s.channel.selectedChannelId)
export const useSelectedChannel = () => {
  const channels = useChannels()
  const selectedId = useSelectedChannelId()
  return channels.find((c) => c.id === selectedId) ?? null
}

// Stable empty arrays to prevent infinite re-renders
const EMPTY_MESSAGES: Message[] = []
const EMPTY_THREADS: Thread[] = []
const EMPTY_DIRECT_MESSAGES: DirectMessage[] = []
const EMPTY_TYPING: TypingIndicator[] = []
const EMPTY_BOTS: AIBot[] = []

// Message selectors
export const useChannelMessages = (channelId: string) =>
  useCommunicationsStore((s) => s.channel.channelMessages[channelId] ?? EMPTY_MESSAGES)

// Thread selectors
export const useThreads = (channelId: string) =>
  useCommunicationsStore((s) => s.thread.threads[channelId] ?? EMPTY_THREADS)
export const useSelectedThreadId = () => useCommunicationsStore((s) => s.thread.selectedThreadId)
export const useThreadMessages = (threadId: string) =>
  useCommunicationsStore((s) => s.thread.threadMessages[threadId] ?? EMPTY_MESSAGES)

// Call selectors
export const useActiveCall = () => useCommunicationsStore((s) => s.call.activeCall)
export const useCallParticipants = () => useCommunicationsStore((s) => s.call.participants)
export const useLocalMediaState = () => useCommunicationsStore((s) => s.call.localMediaState)
export const useScreenShares = () => useCommunicationsStore((s) => s.call.screenShares)

// DM selectors
export const useDirectConversations = () => useCommunicationsStore((s) => s.direct.conversations)
export const useSelectedDirectId = () => useCommunicationsStore((s) => s.direct.selectedConversationId)
export const useDirectMessages = (conversationId: string) =>
  useCommunicationsStore((s) => s.direct.conversationMessages[conversationId] ?? EMPTY_DIRECT_MESSAGES)

// Presence selectors
export const useUserPresence = (userId: string) =>
  useCommunicationsStore((s) => s.presence.presenceMap[userId])
export const useTypingIndicators = (key: string) =>
  useCommunicationsStore((s) => s.presence.typingIndicators[key] ?? EMPTY_TYPING)

// AI selectors
export const useBots = () => useCommunicationsStore((s) => s.ai.bots)
export const useChannelBots = (channelId: string) =>
  useCommunicationsStore((s) => s.ai.channelBots[channelId] ?? EMPTY_BOTS)

// UI selectors
export const useSidebarCollapsed = () => useCommunicationsStore((s) => s.ui.sidebarCollapsed)
export const useActiveSidebarTab = () => useCommunicationsStore((s) => s.ui.activeSidebarTab)
export const useRightPanelOpen = () => useCommunicationsStore((s) => s.ui.rightPanelOpen)
export const useRightPanelContent = () => useCommunicationsStore((s) => s.ui.rightPanelContent)
export const useActiveModal = () => useCommunicationsStore((s) => s.ui.activeModal)
export const useModalData = () => useCommunicationsStore((s) => s.ui.modalData)
export const useViewMode = () => useCommunicationsStore((s) => s.ui.viewMode)

// Workspace & Privacy selectors
export const useCommunicationWorkspaceId = () => useCommunicationsStore((s) => s.ui.communicationWorkspaceId)
export const useIsPrivateMode = () => useCommunicationsStore((s) => s.ui.isPrivateMode)
export const useIsPrivateDMs = () => useCommunicationsStore((s) => s.ui.isPrivateDMs)

export default useCommunicationsStore
