/**
 * useAI Hook
 * Main hook for AI chat functionality
 * @module shared/communications/chat/hooks/useAI
 */

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import type {
  AISession,
  AIMessage,
  AIConfig,
  AIKnowledgeContext,
  UseAIOptions,
  UseAIReturn,
  AISettings,
  DEFAULT_AI_SETTINGS,
} from "../types/ai";
import { generateMessageId as generateId } from "../util/id";

// Session ID type (can be Convex Id or string)
type SessionId = Id<"aiChatSessions"> | string;

export interface UseAIProps extends UseAIOptions {
  // Data source callbacks (to be provided by feature implementation)
  onCreateSession?: (title: string, isGlobal?: boolean) => Promise<AISession | null>;
  onSendMessage?: (
    sessionId: SessionId,
    message: string,
    context?: AIKnowledgeContext
  ) => Promise<AIMessage | null>;
  onSelectSession?: (sessionId: SessionId | null) => void;
  onRegenerate?: (sessionId: SessionId, messageId: string) => Promise<AIMessage | null>;
  
  // Initial data
  sessions?: AISession[];
  selectedSession?: AISession | null;
  isLoading?: boolean;
  isSending?: boolean;
  globalMode?: boolean;
}

/**
 * Main AI hook for managing AI chat state and actions
 */
export function useAI({
  workspaceId,
  userId,
  sessionId,
  config,
  onCreateSession,
  onSendMessage,
  onSelectSession,
  onRegenerate,
  sessions = [],
  selectedSession = null,
  isLoading = false,
  isSending = false,
  globalMode = false,
}: UseAIProps): UseAIReturn {
  // Local state for messages (derived from session)
  const messages = selectedSession?.messages || [];

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Send message
  const sendMessage = useCallback(
    async (text: string, context?: AIKnowledgeContext) => {
      if (!text.trim()) return;

      try {
        setError(null);

        // If no session, create one first
        let currentSessionId = sessionId || selectedSession?._id;
        
        if (!currentSessionId && onCreateSession) {
          const newSession = await onCreateSession(
            text.slice(0, 50),
            globalMode
          );
          if (!newSession) {
            throw new Error("Failed to create session");
          }
          currentSessionId = newSession._id;
        }

        if (!currentSessionId) {
          throw new Error("No session available");
        }

        // Send the message
        if (onSendMessage) {
          await onSendMessage(currentSessionId, text, context);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send message";
        setError(message);
        console.error("Failed to send message:", err);
      }
    },
    [sessionId, selectedSession, onCreateSession, onSendMessage, globalMode]
  );

  // Create new session
  const createSession = useCallback(
    async (title: string) => {
      if (!onCreateSession) return null;

      try {
        setError(null);
        const session = await onCreateSession(title, globalMode);
        return session;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to create session";
        setError(message);
        console.error("Failed to create session:", err);
        return null;
      }
    },
    [onCreateSession, globalMode]
  );

  // Select session
  const selectSession = useCallback(
    (id: Id<"aiChatSessions"> | null) => {
      onSelectSession?.(id);
    },
    [onSelectSession]
  );

  // Regenerate response
  const regenerate = useCallback(
    async (messageId: string) => {
      const currentSessionId = sessionId || selectedSession?._id;
      if (!currentSessionId || !onRegenerate) return;

      try {
        setError(null);
        await onRegenerate(currentSessionId, messageId);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to regenerate";
        setError(message);
        console.error("Failed to regenerate:", err);
      }
    },
    [sessionId, selectedSession, onRegenerate]
  );

  // Clear session (reset to empty)
  const clearSession = useCallback(() => {
    selectSession(null);
  }, [selectSession]);

  return {
    session: selectedSession,
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    createSession,
    selectSession,
    regenerate,
    clearSession,
  };
}

export default useAI;
