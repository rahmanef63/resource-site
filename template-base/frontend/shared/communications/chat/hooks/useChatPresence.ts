/**
 * Presence and typing indicator hook
 * @module shared/chat/hooks/useChatPresence
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { PresenceInfo, TypingInfo } from "../types/chat";
import { CHAT_CONSTANTS } from "../constants/chat";

export type UseChatPresenceOptions = {
  roomId: string;
  userId: string;
  enabled?: boolean;
};

export type UseChatPresenceReturn = {
  presence: PresenceInfo[];
  typingUsers: TypingInfo[];
  setTyping: (isTyping: boolean) => void;
  updatePresence: (status: PresenceInfo["status"]) => void;
};

/**
 * Hook for managing user presence and typing indicators
 */
export function useChatPresence(
  options: UseChatPresenceOptions
): UseChatPresenceReturn {
  const { roomId, userId, enabled = true } = options;

  const [presence, setPresence] = useState<PresenceInfo[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingInfo[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const presenceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Update typing status
   */
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!enabled) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (isTyping) {
        // TODO: Send typing event to backend

        // Set timeout to automatically stop typing
        typingTimeoutRef.current = setTimeout(() => {
          setTyping(false);
        }, CHAT_CONSTANTS.TYPING_INDICATOR_TIMEOUT_MS);
      } else {
        // TODO: Send stop typing event to backend
      }
    },
    [enabled, roomId, userId]
  );

  /**
   * Update presence status
   */
  const updatePresence = useCallback(
    (status: PresenceInfo["status"]) => {
      if (!enabled) return;

      // TODO: Send presence update to backend

      // Update local presence
      setPresence((prev) =>
        prev.map((p) =>
          p.userId === userId
            ? { ...p, status, lastSeen: Date.now() }
            : p
        )
      );
    },
    [enabled, roomId, userId]
  );

  /**
   * Clean up stale typing indicators
   */
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) =>
        prev.filter(
          (t) =>
            now - t.startedAt < CHAT_CONSTANTS.TYPING_INDICATOR_TIMEOUT_MS
        )
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  /**
   * Send periodic presence heartbeat
   */
  useEffect(() => {
    if (!enabled) return;

    // Initial presence
    updatePresence("online");

    // Periodic heartbeat
    presenceIntervalRef.current = setInterval(() => {
      updatePresence("online");
    }, CHAT_CONSTANTS.PRESENCE_UPDATE_INTERVAL_MS);

    // Set offline on unmount
    return () => {
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
      }
      updatePresence("offline");
    };
  }, [enabled, updatePresence]);

  /**
   * Handle visibility change
   */
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence("away");
      } else {
        updatePresence("online");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, updatePresence]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    presence,
    typingUsers,
    setTyping,
    updatePresence,
  };
}
