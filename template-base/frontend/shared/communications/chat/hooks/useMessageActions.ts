/**
 * Message actions hook
 * @module shared/chat/hooks/useMessageActions
 */

import { useCallback, useState } from "react";
import type { Message, UserMeta } from "../types/message";
import type { ChatConfig } from "../types/config";
import type { RoomMeta } from "../types/chat";
import {
  canEdit,
  canDelete,
  canPin,
} from "../util/guard";
import {
  formatTimestamp,
  getMessagePreview,
  isEdited,
  isDeleted,
} from "../util/formatMessage";
import { downloadAttachment, copyAttachmentUrl } from "../lib/upload";

export type MessageAction =
  | "edit"
  | "delete"
  | "pin"
  | "unpin"
  | "reply"
  | "react"
  | "copy"
  | "forward"
  | "quote";

export type UseMessageActionsOptions = {
  currentUser: UserMeta;
  roomMeta?: RoomMeta | null;
  config?: ChatConfig;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string, hard?: boolean) => void;
  onPin?: (messageId: string, pinned: boolean) => void;
  onReply?: (message: Message) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onQuote?: (message: Message) => void;
};

export type UseMessageActionsReturn = {
  getAvailableActions: (message: Message) => MessageAction[];
  handleAction: (message: Message, action: MessageAction) => void;
  copyMessageText: (message: Message) => Promise<void>;
  copyMessageLink: (message: Message) => Promise<void>;
  isMessageEditable: (message: Message) => boolean;
  isMessageDeletable: (message: Message) => boolean;
  isMessagePinnable: (message: Message) => boolean;
};

/**
 * Hook for message action handling
 */
export function useMessageActions(
  options: UseMessageActionsOptions
): UseMessageActionsReturn {
  const {
    currentUser,
    roomMeta,
    config,
    onEdit,
    onDelete,
    onPin,
    onReply,
    onReact,
    onQuote,
  } = options;

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  /**
   * Check if message is editable by current user
   */
  const isMessageEditable = useCallback(
    (message: Message): boolean => {
      if (isDeleted(message)) return false;
      return canEdit(currentUser.id, message, roomMeta?.roles, config);
    },
    [currentUser.id, roomMeta, config]
  );

  /**
   * Check if message is deletable by current user
   */
  const isMessageDeletable = useCallback(
    (message: Message): boolean => {
      return canDelete(currentUser.id, message, roomMeta?.roles, config);
    },
    [currentUser.id, roomMeta, config]
  );

  /**
   * Check if message can be pinned
   */
  const isMessagePinnable = useCallback(
    (message: Message): boolean => {
      if (isDeleted(message)) return false;
      return canPin(currentUser.id, roomMeta?.roles, config);
    },
    [currentUser.id, roomMeta, config]
  );

  /**
   * Get available actions for a message
   */
  const getAvailableActions = useCallback(
    (message: Message): MessageAction[] => {
      const actions: MessageAction[] = [];

      // Always available
      actions.push("copy");

      if (!isDeleted(message)) {
        if (config?.canReply) {
          actions.push("reply");
        }

        if (config?.reactionEnabled) {
          actions.push("react");
        }

        actions.push("quote");

        if (isMessageEditable(message)) {
          actions.push("edit");
        }

        if (isMessagePinnable(message)) {
          actions.push(message.isPinned ? "unpin" : "pin");
        }
      }

      if (isMessageDeletable(message)) {
        actions.push("delete");
      }

      return actions;
    },
    [
      config,
      isMessageEditable,
      isMessageDeletable,
      isMessagePinnable,
    ]
  );

  /**
   * Copy message text to clipboard
   */
  const copyMessageText = useCallback(async (message: Message) => {
    const text = message.content.text || message.content.markdown || "";
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to copy message text:", error);
      throw error;
    }
  }, []);

  /**
   * Copy message link to clipboard
   */
  const copyMessageLink = useCallback(async (message: Message) => {
    // TODO: Generate proper message link based on routing
    const link = `${window.location.origin}/chat/${message.roomId}/${message.id}`;
    try {
      await navigator.clipboard.writeText(link);
    } catch (error) {
      console.error("Failed to copy message link:", error);
      throw error;
    }
  }, []);

  /**
   * Handle message action
   */
  const handleAction = useCallback(
    (message: Message, action: MessageAction) => {
      switch (action) {
        case "edit":
          onEdit?.(message.id);
          break;

        case "delete":
          onDelete?.(message.id);
          break;

        case "pin":
          onPin?.(message.id, true);
          break;

        case "unpin":
          onPin?.(message.id, false);
          break;

        case "reply":
          onReply?.(message);
          break;

        case "react":
          // Show emoji picker
          setSelectedMessage(message);
          break;

        case "copy":
          copyMessageText(message);
          break;

        case "quote":
          onQuote?.(message);
          break;

        default:
          console.warn(`Unknown action: ${action}`);
      }
    },
    [onEdit, onDelete, onPin, onReply, onQuote, copyMessageText]
  );

  return {
    getAvailableActions,
    handleAction,
    copyMessageText,
    copyMessageLink,
    isMessageEditable,
    isMessageDeletable,
    isMessagePinnable,
  };
}
