/**
 * Main chat hook
 * @module shared/chat/hooks/useChat
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { ChatDataSource, ChatRoomRef, RoomMeta } from "../types/chat";
import type { Message, MessageDraft, UserMeta } from "../types/message";
import type { ChatConfig } from "../types/config";
import type { ChatEvents } from "../types/events";
import { mergeConfig } from "../config/defaultChatConfig";
import { canSend, validateMessageLength } from "../util/guard";
import { generateMessageId } from "../util/id";
import { saveDraft, loadDraft, clearDraft } from "../util/storage";

export type UseChatOptions = {
  room: ChatRoomRef;
  dataSource: ChatDataSource;
  currentUser: UserMeta;
  config?: Partial<ChatConfig>;
  events?: ChatEvents;
  autoLoad?: boolean;
};

export type UseChatReturn = {
  // State
  messages: Message[];
  roomMeta: RoomMeta | null;
  participants: UserMeta[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;

  // Actions
  sendMessage: (draft: MessageDraft) => Promise<void>;
  editMessage: (messageId: string, patch: Partial<Message>) => Promise<void>;
  deleteMessage: (messageId: string, hard?: boolean) => Promise<void>;
  pinMessage: (messageId: string, pinned: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;

  // Config
  config: Required<ChatConfig>;
};

/**
 * Main chat hook
 * Manages chat state, messages, and operations
 */
export function useChat(options: UseChatOptions): UseChatReturn {
  const { room, dataSource, currentUser, config: configPartial, events, autoLoad = true } = options;

  const config = mergeConfig(configPartial);
  const [messages, setMessages] = useState<Message[]>([]);
  const [roomMeta, setRoomMeta] = useState<RoomMeta | null>(null);
  const [participants, setParticipants] = useState<UserMeta[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Load room metadata
   */
  const loadRoomMeta = useCallback(async () => {
    try {
      const meta = await dataSource.getRoomMeta(room.roomId);
      setRoomMeta(meta);
    } catch (err) {
      console.error("Failed to load room meta:", err);
      setError(err as Error);
    }
  }, [room.roomId, dataSource]);

  /**
   * Load participants
   */
  const loadParticipants = useCallback(async () => {
    try {
      const parts = await dataSource.listParticipants(room.roomId);
      setParticipants(parts);
    } catch (err) {
      console.error("Failed to load participants:", err);
    }
  }, [room.roomId, dataSource]);

  /**
   * Load messages
   */
  const loadMessages = useCallback(
    async (reset = false) => {
      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await dataSource.listMessages(
          room.roomId,
          reset ? undefined : cursor
        );

        setMessages((prev) =>
          reset ? result.items : [...prev, ...result.items]
        );
        setCursor(result.cursor);
        setHasMore(result.hasMore);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError(err as Error);
        events?.onError?.(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [room.roomId, dataSource, cursor, isLoading, events]
  );

  /**
   * Load more messages (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadMessages(false);
  }, [hasMore, isLoading, loadMessages]);

  /**
   * Refresh (reload from start)
   */
  const refresh = useCallback(async () => {
    setCursor(undefined);
    await loadMessages(true);
    await loadRoomMeta();
    await loadParticipants();
  }, [loadMessages, loadRoomMeta, loadParticipants]);

  /**
   * Send message
   */
  const sendMessage = useCallback(
    async (draft: MessageDraft) => {
      // Validate permissions
      if (!canSend(currentUser.id, roomMeta?.roles, config)) {
        const error = new Error("Permission denied");
        events?.onError?.(error);
        throw error;
      }

      // Validate message
      const validation = validateMessageLength(
        draft.text || draft.markdown || "",
        config
      );
      if (!validation.valid) {
        const error = new Error(validation.error);
        events?.onError?.(error);
        throw error;
      }

      try {
        // Call event handler
        await events?.onSend?.(draft);

        // Send to backend
        const message = await dataSource.sendMessage(room.roomId, draft);

        // Optimistically add to local state
        setMessages((prev) => [...prev, message]);

        // Clear draft from storage
        clearDraft(room.roomId);
      } catch (err) {
        console.error("Failed to send message:", err);
        setError(err as Error);
        events?.onError?.(err as Error);
        throw err;
      }
    },
    [room.roomId, currentUser.id, roomMeta, config, dataSource, events]
  );

  /**
   * Edit message
   */
  const editMessage = useCallback(
    async (messageId: string, patch: Partial<Message>) => {
      try {
        await events?.onEdit?.(messageId, patch);

        const updated = await dataSource.editMessage(
          room.roomId,
          messageId,
          patch
        );

        // Update local state
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? updated : m))
        );
      } catch (err) {
        console.error("Failed to edit message:", err);
        setError(err as Error);
        events?.onError?.(err as Error);
        throw err;
      }
    },
    [room.roomId, dataSource, events]
  );

  /**
   * Delete message
   */
  const deleteMessage = useCallback(
    async (messageId: string, hard = false) => {
      try {
        await events?.onDelete?.(messageId, hard ? "hard" : "soft");

        await dataSource.deleteMessage(room.roomId, messageId, hard);

        // Update local state
        if (hard) {
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === messageId ? { ...m, deletedAt: Date.now() } : m
            )
          );
        }
      } catch (err) {
        console.error("Failed to delete message:", err);
        setError(err as Error);
        events?.onError?.(err as Error);
        throw err;
      }
    },
    [room.roomId, dataSource, events]
  );

  /**
   * Pin/unpin message
   */
  const pinMessage = useCallback(
    async (messageId: string, pinned: boolean) => {
      try {
        await events?.onPin?.(messageId, pinned);

        await dataSource.pinMessage(room.roomId, messageId, pinned);

        // Update local state
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, isPinned: pinned } : m))
        );
      } catch (err) {
        console.error("Failed to pin message:", err);
        setError(err as Error);
        events?.onError?.(err as Error);
        throw err;
      }
    },
    [room.roomId, dataSource, events]
  );

  /**
   * React to message
   */
  const reactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        await events?.onReaction?.(messageId, emoji);

        // Update local state optimistically
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === messageId) {
              const reactions = { ...m.reactions };
              if (!reactions[emoji]) {
                reactions[emoji] = [];
              }
              if (!reactions[emoji].includes(currentUser.id)) {
                reactions[emoji] = [...reactions[emoji], currentUser.id];
              } else {
                reactions[emoji] = reactions[emoji].filter(
                  (id) => id !== currentUser.id
                );
                if (reactions[emoji].length === 0) {
                  delete reactions[emoji];
                }
              }
              return { ...m, reactions };
            }
            return m;
          })
        );

        // TODO: Call backend to persist reaction
      } catch (err) {
        console.error("Failed to react to message:", err);
        events?.onError?.(err as Error);
      }
    },
    [currentUser.id, events]
  );

  /**
   * Initial load
   */
  useEffect(() => {
    if (autoLoad) {
      loadMessages(true);
      loadRoomMeta();
      loadParticipants();
    }

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [room.roomId, autoLoad]);

  return {
    messages,
    roomMeta,
    participants,
    isLoading,
    error,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    pinMessage,
    loadMore,
    refresh,
    reactToMessage,
    config,
  };
}
