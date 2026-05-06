/**
 * useAIStore Hook
 * Zustand store for AI chat state management
 * @module shared/communications/chat/hooks/useAIStore
 */

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Id } from "@/convex/_generated/dataModel";
import type {
  AISession,
  AIMessage,
  AIStoreState,
  AIStoreActions,
  KnowledgeSourceType,
} from "../types/ai";

// ============================================================================
// Store Type
// ============================================================================

export type AIStore = AIStoreState & AIStoreActions;

// ============================================================================
// Initial State
// ============================================================================

const initialState: AIStoreState = {
  workspaceId: null,
  userId: null,
  sessions: [],
  selectedSessionId: null,
  isLoading: false,
  isSending: false,
  error: null,
  globalMode: false,
  knowledgeEnabled: true,
  selectedKnowledgeSources: ["wiki"],
  selectedSession: null,
};

// ============================================================================
// Store Factory
// ============================================================================

/**
 * Create AI store instance
 * Can be used to create isolated stores for different contexts
 */
export const createAIStore = (storeName = "ai-chat-store") =>
  create<AIStore>()(
    persist(
      (set, get) => ({
        ...initialState,

        // Initialize
        init: (workspaceId, userId) => {
          set({
            workspaceId,
            userId,
            error: null,
          });
        },

        // Set sessions
        setSessions: (sessions) => {
          const { selectedSessionId } = get();
          const selectedSession =
            sessions.find((s) => s._id === selectedSessionId) || null;
          set({ sessions, selectedSession, isLoading: false });
        },

        // Select session
        setSelectedSession: (sessionId) => {
          const { sessions } = get();
          const selectedSession =
            sessions.find((s) => s._id === sessionId) || null;
          set({ selectedSessionId: sessionId, selectedSession });
        },

        // Loading states
        setLoading: (isLoading) => set({ isLoading }),
        setSending: (isSending) => set({ isSending }),
        setError: (error) => set({ error }),

        // Mode toggles
        setGlobalMode: (globalMode) => set({ globalMode }),
        setKnowledgeEnabled: (knowledgeEnabled) => set({ knowledgeEnabled }),
        setKnowledgeSources: (selectedKnowledgeSources) =>
          set({ selectedKnowledgeSources }),

        // Session CRUD
        addSession: (session) => {
          const { sessions } = get();
          set({ sessions: [session, ...sessions] });
        },

        updateSession: (sessionId, updates) => {
          const { sessions, selectedSessionId, selectedSession } = get();
          const updatedSessions = sessions.map((s) =>
            s._id === sessionId ? { ...s, ...updates } : s
          );
          const updatedSelectedSession =
            sessionId === selectedSessionId && selectedSession
              ? { ...selectedSession, ...updates }
              : selectedSession;
          set({
            sessions: updatedSessions,
            selectedSession: updatedSelectedSession,
          });
        },

        removeSession: (sessionId) => {
          const { sessions, selectedSessionId } = get();
          const filteredSessions = sessions.filter((s) => s._id !== sessionId);
          set({
            sessions: filteredSessions,
            selectedSessionId:
              sessionId === selectedSessionId ? null : selectedSessionId,
            selectedSession:
              sessionId === selectedSessionId ? null : get().selectedSession,
          });
        },

        // Message operations
        addMessage: (sessionId, message) => {
          const { sessions, selectedSessionId, selectedSession } = get();
          const updatedSessions = sessions.map((s) => {
            if (s._id === sessionId) {
              return {
                ...s,
                messages: [...s.messages, message],
                updatedAt: Date.now(),
              };
            }
            return s;
          });

          const updatedSelectedSession =
            sessionId === selectedSessionId && selectedSession
              ? {
                  ...selectedSession,
                  messages: [...selectedSession.messages, message],
                  updatedAt: Date.now(),
                }
              : selectedSession;

          set({
            sessions: updatedSessions,
            selectedSession: updatedSelectedSession,
          });
        },

        // Reset
        reset: () => set(initialState),
      }),
      {
        name: storeName,
        partialize: (state) => ({
          globalMode: state.globalMode,
          knowledgeEnabled: state.knowledgeEnabled,
          selectedKnowledgeSources: state.selectedKnowledgeSources,
        }),
      }
    )
  );

// ============================================================================
// Default Store Instance
// ============================================================================

export const useAIStoreBase = createAIStore();

// ============================================================================
// Selectors
// ============================================================================

export const aiStoreSelectors = {
  sessions: (state: AIStore) => state.sessions,
  selectedSession: (state: AIStore) => state.selectedSession,
  selectedSessionId: (state: AIStore) => state.selectedSessionId,
  isLoading: (state: AIStore) => state.isLoading,
  isSending: (state: AIStore) => state.isSending,
  error: (state: AIStore) => state.error,
  globalMode: (state: AIStore) => state.globalMode,
  knowledgeEnabled: (state: AIStore) => state.knowledgeEnabled,
  selectedKnowledgeSources: (state: AIStore) => state.selectedKnowledgeSources,
  messages: (state: AIStore) => state.selectedSession?.messages || [],
};

export default useAIStoreBase;
