import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import type { Id } from '@/convex/_generated/dataModel';
import type { KnowledgeSourceType } from '../types';

// ============================================================================
// Types
// ============================================================================

export interface AIMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  branches?: Array<{ id: string; content: string; timestamp: number }>;
  attachments?: Array<{ id: string; name: string; type: string; url: string; size: number }>;
  replyTo?: string;
  feedback?: string;
  reasoning?: string;
  metadata?: {
    tokenCount?: number;
    contextIds?: string[];
    model?: string;
    duration?: number;
  };
}

/**
 * AI Session — canonical type for the AI feature's Zustand store.
 * For chat-integration scenarios, see `shared/communications/chat/types/ai.ts`
 * which defines a separate AISession that extends the chat Message model.
 */
export interface AISession {
  _id: Id<"aiChatSessions">;
  id: string; // Alias for _id for compatibility with ConversationItem
  workspaceId?: string;
  userId: string;
  title: string;
  icon?: string; // Lucide icon name
  topic?: string; // Topic/description for the session
  isGlobal?: boolean;
  messages: AIMessage[];
  status: 'active' | 'archived';
  createdAt: number;
  updatedAt: number;
  // New fields for conversation features
  isPinned?: boolean;
  isFavorite?: boolean;
  isMuted?: boolean;
  tags?: string[];
  metadata?: {
    agentId?: string;
    [key: string]: any;
  };
}

export interface AIStoreState {
  // State
  workspaceId: Id<"workspaces"> | null;
  userId: string | null;
  sessions: AISession[];
  selectedSessionId: Id<"aiChatSessions"> | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  globalMode: boolean; // true = personal/global sessions, false = workspace sessions

  // Knowledge sources
  knowledgeEnabled: boolean; // Master toggle for knowledge
  selectedKnowledgeSources: KnowledgeSourceType[];

  // Computed
  selectedSession: AISession | null;

  // Actions
  init: (workspaceId: Id<"workspaces"> | null, userId: string | null) => void;
  setSessions: (sessions: AISession[]) => void;
  setSelectedSession: (sessionId: Id<"aiChatSessions"> | null) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setError: (error: string | null) => void;
  setGlobalMode: (global: boolean) => void;
  setKnowledgeEnabled: (enabled: boolean) => void;
  setKnowledgeSources: (sources: KnowledgeSourceType[]) => void;

  // Session actions
  addSession: (session: AISession) => void;
  updateSession: (sessionId: Id<"aiChatSessions">, updates: Partial<AISession>) => void;
  removeSession: (sessionId: Id<"aiChatSessions">) => void;

  // New conversation actions
  pinSession: (sessionId: Id<"aiChatSessions">, isPinned: boolean) => void;
  favoriteSession: (sessionId: Id<"aiChatSessions">, isFavorite: boolean) => void;
  archiveSession: (sessionId: Id<"aiChatSessions">, isArchived: boolean) => void;
  renameSession: (sessionId: Id<"aiChatSessions">, title: string, topic?: string) => void;

  // Message actions
  addMessage: (sessionId: Id<"aiChatSessions">, message: AIMessage) => void;

  // Reset
  reset: () => void;
}

// ============================================================================
// Store
// ============================================================================

const initialState = {
  workspaceId: null,
  userId: null,
  sessions: [],
  selectedSessionId: null,
  isLoading: false,
  isSending: false,
  error: null,
  selectedSession: null,
  globalMode: false,
  knowledgeEnabled: false, // Off by default — user must opt-in to Think Harder mode
  selectedKnowledgeSources: ['wiki'] as KnowledgeSourceType[], // Default to wiki enabled
};

export const useAIStore = create<AIStoreState>()((set, get) => ({
  ...initialState,

  // Initialize store with workspace and user
  init: (workspaceId, userId) => {
    set({
      workspaceId,
      userId,
      sessions: [],
      selectedSessionId: null,
      isLoading: false,
      error: null,
    });
  },

  // Set sessions from query
  setSessions: (sessions) => {
    const state = get();
    set({
      sessions,
      // Update selectedSession if it exists in new sessions
      selectedSession: state.selectedSessionId
        ? sessions.find(s => s._id === state.selectedSessionId) || null
        : null,
    });
  },

  // Select a session
  setSelectedSession: (sessionId) => {
    const sessions = get().sessions;
    const selectedSession = sessionId
      ? sessions.find(s => s._id === sessionId) || null
      : null;
    set({
      selectedSessionId: sessionId,
      selectedSession,
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setSending: (sending) => set({ isSending: sending }),
  setError: (error) => set({ error }),
  setGlobalMode: (global) => set({ globalMode: global, selectedSessionId: null, selectedSession: null }),
  setKnowledgeEnabled: (enabled) => set({ knowledgeEnabled: enabled }),
  setKnowledgeSources: (sources) => set({ selectedKnowledgeSources: sources }),

  // Add a new session
  addSession: (session) => {
    set((state) => ({
      sessions: [session, ...state.sessions],
      selectedSessionId: session._id,
      selectedSession: session,
    }));
  },

  // Update a session
  updateSession: (sessionId, updates) => {
    set((state) => {
      const newSessions = state.sessions.map(s =>
        s._id === sessionId ? { ...s, ...updates } : s
      );
      const selectedSession = state.selectedSessionId === sessionId
        ? newSessions.find(s => s._id === sessionId) || null
        : state.selectedSession;
      return {
        sessions: newSessions,
        selectedSession,
      };
    });
  },

  // Remove a session
  removeSession: (sessionId) => {
    set((state) => {
      const newSessions = state.sessions.filter(s => s._id !== sessionId);
      const wasSelected = state.selectedSessionId === sessionId;
      return {
        sessions: newSessions,
        selectedSessionId: wasSelected ? null : state.selectedSessionId,
        selectedSession: wasSelected ? null : state.selectedSession,
      };
    });
  },

  // Pin/Unpin a session
  pinSession: (sessionId, isPinned) => {
    set((state) => {
      const newSessions = state.sessions.map(s =>
        s._id === sessionId ? { ...s, isPinned, updatedAt: Date.now() } : s
      );
      // Sort pinned sessions to top
      newSessions.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
      const selectedSession = state.selectedSessionId === sessionId
        ? newSessions.find(s => s._id === sessionId) || null
        : state.selectedSession;
      return { sessions: newSessions, selectedSession };
    });
    toast.success(isPinned ? 'Session pinned' : 'Session unpinned');
  },

  // Favorite/Unfavorite a session
  favoriteSession: (sessionId, isFavorite) => {
    set((state) => {
      const newSessions = state.sessions.map(s =>
        s._id === sessionId ? { ...s, isFavorite, updatedAt: Date.now() } : s
      );
      const selectedSession = state.selectedSessionId === sessionId
        ? newSessions.find(s => s._id === sessionId) || null
        : state.selectedSession;
      return { sessions: newSessions, selectedSession };
    });
    toast.success(isFavorite ? 'Added to favorites' : 'Removed from favorites');
  },

  // Archive/Unarchive a session
  archiveSession: (sessionId, isArchived) => {
    set((state) => {
      const newStatus: AISession['status'] = isArchived ? 'archived' : 'active';
      const newSessions: AISession[] = state.sessions.map(s =>
        s._id === sessionId
          ? { ...s, status: newStatus, updatedAt: Date.now() }
          : s
      );
      const selectedSession = state.selectedSessionId === sessionId
        ? newSessions.find(s => s._id === sessionId) || null
        : state.selectedSession;
      return { sessions: newSessions, selectedSession };
    });
    toast.success(isArchived ? 'Session archived' : 'Session unarchived');
  },

  // Rename a session
  renameSession: (sessionId, title, topic) => {
    set((state) => {
      const updates: Partial<AISession> = { title, updatedAt: Date.now() };
      if (topic !== undefined) updates.topic = topic;
      const newSessions = state.sessions.map(s =>
        s._id === sessionId ? { ...s, ...updates } : s
      );
      const selectedSession = state.selectedSessionId === sessionId
        ? newSessions.find(s => s._id === sessionId) || null
        : state.selectedSession;
      return { sessions: newSessions, selectedSession };
    });
    toast.success('Session renamed');
  },

  // Add message to a session
  addMessage: (sessionId, message) => {
    set((state) => {
      const newSessions = state.sessions.map(s => {
        if (s._id === sessionId) {
          return {
            ...s,
            messages: [...s.messages, message],
            updatedAt: Date.now(),
          };
        }
        return s;
      });
      const selectedSession = state.selectedSessionId === sessionId
        ? newSessions.find(s => s._id === sessionId) || null
        : state.selectedSession;
      return {
        sessions: newSessions,
        selectedSession,
      };
    });
  },

  // Reset store
  reset: () => set(initialState),
}));

// ============================================================================
// Selectors (for performance optimization)
// ============================================================================

export const selectSessions = (state: AIStoreState) => state.sessions;
export const selectSelectedSession = (state: AIStoreState) => state.selectedSession;
export const selectIsLoading = (state: AIStoreState) => state.isLoading;
export const selectIsSending = (state: AIStoreState) => state.isSending;
