/**
 * Event handler types for chat system
 * @module shared/chat/types/events
 */

import type {
  Message,
  MessageDraft,
  ModerationResult,
  UploadedRef,
} from "./message";

/**
 * Chat event handlers
 * These callbacks allow features to customize chat behavior
 */
export type ChatEvents = {
  /** Called when user sends a message */
  onSend?: (msg: MessageDraft) => void | Promise<void>;

  /** Called when user edits a message */
  onEdit?: (
    messageId: string,
    patch: Partial<Message>
  ) => void | Promise<void>;

  /** Called when user deletes a message */
  onDelete?: (
    messageId: string,
    mode: "soft" | "hard"
  ) => void | Promise<void>;

  /** Called when user pins/unpins a message */
  onPin?: (messageId: string, pinned: boolean) => void | Promise<void>;

  /** Called when user uploads files */
  onUpload?: (files: File[]) => Promise<UploadedRef[]>;

  /** Called when user executes a slash command */
  onCommand?: (cmd: string, args: string[]) => void | Promise<void>;

  /** Called when moderation check completes */
  onModeration?: (result: ModerationResult) => void | Promise<void>;

  /** Called when user reacts to a message */
  onReaction?: (messageId: string, emoji: string) => void | Promise<void>;

  /** Called when user mentions someone */
  onMention?: (userIds: string[], messageId: string) => void | Promise<void>;

  /** Called when message is read */
  onRead?: (messageId: string) => void | Promise<void>;

  /** Called when user starts/stops typing */
  onTyping?: (isTyping: boolean) => void | Promise<void>;

  /** Called on any error */
  onError?: (error: Error) => void;
};

/**
 * Command definition
 */
export type CommandDefinition = {
  name: string;
  description: string;
  usage: string;
  handler: (args: string[]) => void | Promise<void>;
  permissions?: string[];
};

/**
 * Message bus event types
 */
export type MessageBusEvent =
  | { type: "message:new"; message: Message }
  | { type: "message:edited"; messageId: string; message: Message }
  | { type: "message:deleted"; messageId: string }
  | { type: "message:pinned"; messageId: string; pinned: boolean }
  | { type: "reaction:added"; messageId: string; emoji: string; userId: string }
  | {
      type: "reaction:removed";
      messageId: string;
      emoji: string;
      userId: string;
    }
  | { type: "typing:start"; userId: string; userName?: string }
  | { type: "typing:stop"; userId: string }
  | { type: "presence:update"; userId: string; status: string }
  | { type: "room:updated"; roomMeta: any }
  | { type: "participant:added"; userId: string }
  | { type: "participant:removed"; userId: string };
