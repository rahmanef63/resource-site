/**
 * Agent Chat Store
 * 
 * Zustand store for managing chat state across features.
 * Integrates with debug store for tracking AI operations.
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ChatMessage, ChatSession, RecentChatItem } from "./types"

// ============================================================================
// Types
// ============================================================================

interface AgentChatState {
  // Current session
  currentSessionId: string | null
  currentSession: ChatSession | null
  messages: ChatMessage[]
  
  // UI state
  isLoading: boolean
  isSending: boolean
  error: string | null
  
  // Recent chats per feature
  recentChats: Record<string, RecentChatItem[]>
  
  // Input state
  inputValue: string
  attachments: File[]
  replyingTo: string | null
}

interface AgentChatActions {
  // Session actions
  setCurrentSession: (session: ChatSession | null) => void
  setCurrentSessionId: (id: string | null) => void
  updateSession: (sessionId: string, updates: Partial<ChatSession>) => void
  
  // Message actions
  addMessage: (message: ChatMessage) => void
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void
  setMessages: (messages: ChatMessage[]) => void
  clearMessages: () => void
  
  // UI actions
  setLoading: (loading: boolean) => void
  setSending: (sending: boolean) => void
  setError: (error: string | null) => void
  
  // Recent chats actions
  addRecentChat: (featureId: string, chat: RecentChatItem) => void
  updateRecentChat: (featureId: string, chatId: string, updates: Partial<RecentChatItem>) => void
  removeRecentChat: (featureId: string, chatId: string) => void
  getRecentChats: (featureId: string) => RecentChatItem[]
  
  // Input actions
  setInputValue: (value: string) => void
  setAttachments: (attachments: File[]) => void
  addAttachment: (file: File) => void
  removeAttachment: (index: number) => void
  setReplyingTo: (content: string | null) => void
  clearInput: () => void
  
  // Reset
  reset: () => void
}

type AgentChatStore = AgentChatState & AgentChatActions

// ============================================================================
// Initial State
// ============================================================================

const initialState: AgentChatState = {
  currentSessionId: null,
  currentSession: null,
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  recentChats: {},
  inputValue: "",
  attachments: [],
  replyingTo: null,
}

// ============================================================================
// Store
// ============================================================================

const MAX_RECENT_CHATS = 20

export const useAgentChatStore = create<AgentChatStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Session actions
      setCurrentSession: (session) => {
        set({
          currentSession: session,
          currentSessionId: session?._id || null,
          messages: session?.messages || [],
        })
      },

      setCurrentSessionId: (id) => {
        set({ currentSessionId: id })
      },

      updateSession: (sessionId, updates) => {
        const { currentSession } = get()
        if (currentSession && currentSession._id === sessionId) {
          set({
            currentSession: { ...currentSession, ...updates },
          })
        }
      },

      // Message actions
      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                messages: [...state.currentSession.messages, message],
                updatedAt: Date.now(),
              }
            : null,
        }))
      },

      updateMessage: (messageId, updates) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId ? { ...m, ...updates } : m
          ),
          currentSession: state.currentSession
            ? {
                ...state.currentSession,
                messages: state.currentSession.messages.map((m) =>
                  m.id === messageId ? { ...m, ...updates } : m
                ),
              }
            : null,
        }))
      },

      setMessages: (messages) => {
        set({ messages })
      },

      clearMessages: () => {
        set({ messages: [] })
      },

      // UI actions
      setLoading: (loading) => set({ isLoading: loading }),
      setSending: (sending) => set({ isSending: sending }),
      setError: (error) => set({ error }),

      // Recent chats actions
      addRecentChat: (featureId, chat) => {
        set((state) => {
          const existing = state.recentChats[featureId] || []
          // Remove if already exists (will be re-added at top)
          const filtered = existing.filter((c) => c._id !== chat._id)
          const updated = [chat, ...filtered].slice(0, MAX_RECENT_CHATS)
          return {
            recentChats: {
              ...state.recentChats,
              [featureId]: updated,
            },
          }
        })
      },

      updateRecentChat: (featureId, chatId, updates) => {
        set((state) => {
          const existing = state.recentChats[featureId] || []
          return {
            recentChats: {
              ...state.recentChats,
              [featureId]: existing.map((c) =>
                c._id === chatId ? { ...c, ...updates } : c
              ),
            },
          }
        })
      },

      removeRecentChat: (featureId, chatId) => {
        set((state) => {
          const existing = state.recentChats[featureId] || []
          return {
            recentChats: {
              ...state.recentChats,
              [featureId]: existing.filter((c) => c._id !== chatId),
            },
          }
        })
      },

      getRecentChats: (featureId) => {
        return get().recentChats[featureId] || []
      },

      // Input actions
      setInputValue: (value) => set({ inputValue: value }),
      
      setAttachments: (attachments) => set({ attachments }),
      
      addAttachment: (file) => {
        set((state) => ({
          attachments: [...state.attachments, file],
        }))
      },
      
      removeAttachment: (index) => {
        set((state) => ({
          attachments: state.attachments.filter((_, i) => i !== index),
        }))
      },
      
      setReplyingTo: (content) => set({ replyingTo: content }),
      
      clearInput: () => {
        set({
          inputValue: "",
          attachments: [],
          replyingTo: null,
        })
      },

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: "agent-chat-store",
      partialize: (state) => ({
        // Only persist recent chats
        recentChats: state.recentChats,
      }),
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

export const selectCurrentSession = (state: AgentChatStore) => state.currentSession
export const selectMessages = (state: AgentChatStore) => state.messages
export const selectIsLoading = (state: AgentChatStore) => state.isLoading
export const selectIsSending = (state: AgentChatStore) => state.isSending
export const selectRecentChats = (featureId: string) => (state: AgentChatStore) =>
  state.recentChats[featureId] || []
