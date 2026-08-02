/**
 * Configuration types for the reusable chat system
 * @module shared/chat/types/config
 */

export type ChatContextMode =
  | "comment"
  | "support"
  | "workspace"
  | "project"
  | "document"
  | "crm"
  | "system";

export type MessageEditMode = "off" | "author" | "admin";
export type MessageDeletionMode = "off" | "author" | "admin" | "hard";
export type ThemeMode = "light" | "dark" | "auto";
export type TimestampFormat = "relative" | "HH:mm" | "ISO";

export type ChatPermission =
  | "send"
  | "edit"
  | "delete"
  | "pin"
  | "manageUsers"
  | "rename"
  | "changeAvatar";

export type ChatRole = "owner" | "admin" | "member" | "guest";

export type LinkedEntity = {
  id: string;
  type: string;
};

/**
 * Comprehensive chat configuration object
 * Controls all aspects of chat behavior, UI, security, and integrations
 */
export type ChatConfig = {
  // Behavior
  /** Enable group chat features (multiple participants) */
  isGroup?: boolean;
  /** Allow threaded replies to messages */
  canReply?: boolean;
  /** Enable threading UI */
  threading?: boolean;
  /** Allow emoji reactions on messages */
  reactionEnabled?: boolean;
  /** Enable @mentions in messages */
  mentionEnabled?: boolean;
  /** Show read receipts (who has read each message) */
  readReceipts?: boolean;
  /** Show typing indicators when users are composing */
  typingIndicator?: boolean;
  /** Control who can edit messages */
  messageEditing?: MessageEditMode;
  /** Control who can delete messages and how */
  messageDeletion?: MessageDeletionMode;
  /** Maximum message length in characters */
  maxMessageLength?: number;
  /** Automatically scroll to latest message */
  autoScroll?: boolean;

  // Media & Attachments
  /** Allow file attachments */
  allowAttachments?: boolean;
  /** Maximum attachment size in MB */
  maxAttachmentSizeMB?: number;
  /** Show preview for linked URLs */
  linkPreview?: boolean;
  /** Show inline image preview */
  imagePreview?: boolean;
  /** Enable in-app file viewer */
  fileViewer?: boolean;
  /** Enable voice message recording */
  voiceRecorder?: boolean;
  /** Transcribe voice messages to text */
  voiceTranscription?: boolean;
  /** Show media gallery view */
  mediaGallery?: boolean;

  // Access & Security
  /** Enable end-to-end encryption */
  isEncrypted?: boolean;
  /** Allow generating invite links */
  allowInviteLink?: boolean;
  /** Allow exporting chat history */
  allowExport?: boolean;
  /** Enable message pinning */
  pinMessageEnabled?: boolean;
  /** Enable content moderation */
  moderationEnabled?: boolean;
  /** Require approval for new messages (moderated mode) */
  requireApproval?: boolean;

  // UX & i18n
  /** Theme mode */
  theme?: ThemeMode;
  /** Timestamp display format */
  timestampFormat?: TimestampFormat;
  /** Language code (ISO 639-1) */
  language?: string;
  /** Play sound on new message notification */
  notificationSound?: boolean;

  // Integration
  /** Context/use-case mode for this chat */
  contextMode?: ChatContextMode;
  /** Entities this chat is linked to (e.g., page, ticket, project) */
  linkedEntities?: LinkedEntity[];
  /** Custom slash commands available in this chat */
  customCommands?: string[];
  /** Integration IDs (bots, agents) active in this chat */
  integrations?: string[];

  // Roles & Permissions (RBAC)
  /** Permission matrix by role */
  permissions?: Record<ChatRole, ChatPermission[]>;
};

/**
 * Layout configuration for chat UI components
 */
export type ChatLayout = {
  /** Show sidebar (participants, media, etc.) */
  sidebar?: boolean;
  /** Header action buttons to display */
  headerActions?: Array<"search" | "sort" | "filter" | "pin" | "invite">;
  /** Input accessories/tools to show */
  inputAccessories?: Array<"attachments" | "emoji" | "voice" | "commands">;
};
