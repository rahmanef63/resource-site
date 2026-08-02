/**
 * Default chat configuration
 * @module shared/chat/config/defaultChatConfig
 */

import type { ChatConfig, ChatLayout } from "../types/config";
import { DEFAULT_PERMISSIONS } from "../constants/roles";
import { CHAT_CONSTANTS } from "../constants/chat";

/**
 * Base default configuration for all chats
 */
export const DEFAULT_CHAT_CONFIG: Required<ChatConfig> = {
  // Behavior
  isGroup: false,
  canReply: true,
  threading: false,
  reactionEnabled: true,
  mentionEnabled: true,
  readReceipts: true,
  typingIndicator: true,
  messageEditing: "author",
  messageDeletion: "author",
  maxMessageLength: CHAT_CONSTANTS.MAX_MESSAGE_LENGTH_DEFAULT,
  autoScroll: true,

  // Media & Attachments
  allowAttachments: true,
  maxAttachmentSizeMB: CHAT_CONSTANTS.MAX_ATTACHMENT_SIZE_MB_DEFAULT,
  linkPreview: true,
  imagePreview: true,
  fileViewer: true,
  voiceRecorder: false,
  voiceTranscription: false,
  mediaGallery: true,

  // Access & Security
  isEncrypted: false,
  allowInviteLink: false,
  allowExport: false,
  pinMessageEnabled: true,
  moderationEnabled: false,
  requireApproval: false,

  // UX & i18n
  theme: "auto",
  timestampFormat: "relative",
  language: "en",
  notificationSound: true,

  // Integration
  contextMode: "workspace",
  linkedEntities: [],
  customCommands: [],
  integrations: [],

  // Roles & Permissions
  permissions: DEFAULT_PERMISSIONS,
};

/**
 * Default layout configuration
 */
export const DEFAULT_CHAT_LAYOUT: Required<ChatLayout> = {
  sidebar: false,
  headerActions: ["search", "pin"],
  inputAccessories: ["attachments", "emoji"],
};

/**
 * Context-specific configuration presets
 */
export const CHAT_CONFIG_PRESETS: Record<string, Partial<ChatConfig>> = {
  /**
   * Comments/Threads - Side panel discussion on documents/pages
   */
  comment: {
    isGroup: false,
    threading: true,
    canReply: true,
    contextMode: "comment",
    allowAttachments: true,
    maxAttachmentSizeMB: 5,
    messageEditing: "author",
    messageDeletion: "author",
    pinMessageEnabled: false,
    readReceipts: false,
    typingIndicator: false,
  },

  /**
   * Support/Helpdesk - Ticket-based customer support
   */
  support: {
    isGroup: false,
    threading: true,
    contextMode: "support",
    allowAttachments: true,
    maxAttachmentSizeMB: 10,
    fileViewer: true,
    messageEditing: "off",
    messageDeletion: "admin",
    moderationEnabled: true,
    allowExport: true,
    pinMessageEnabled: true,
  },

  /**
   * Workspace chat - Team channels and DMs
   */
  workspace: {
    isGroup: true,
    threading: true,
    canReply: true,
    contextMode: "workspace",
    reactionEnabled: true,
    mentionEnabled: true,
    readReceipts: true,
    typingIndicator: true,
    allowAttachments: true,
    linkPreview: true,
    imagePreview: true,
    mediaGallery: true,
    voiceRecorder: true,
    pinMessageEnabled: true,
    allowInviteLink: true,
    allowExport: true,
  },

  /**
   * Project/Task discussion - Focused project communication
   */
  project: {
    isGroup: true,
    threading: true,
    contextMode: "project",
    mentionEnabled: true,
    allowAttachments: true,
    linkPreview: true,
    pinMessageEnabled: true,
    messageEditing: "author",
    messageDeletion: "admin",
  },

  /**
   * Document collaboration - Real-time doc comments
   */
  document: {
    isGroup: true,
    threading: true,
    canReply: true,
    contextMode: "document",
    mentionEnabled: true,
    reactionEnabled: true,
    allowAttachments: false,
    messageEditing: "author",
    messageDeletion: "author",
    readReceipts: true,
    typingIndicator: true,
  },

  /**
   * CRM chat - Customer relationship messaging
   */
  crm: {
    isGroup: false,
    threading: false,
    contextMode: "crm",
    allowAttachments: true,
    fileViewer: true,
    messageEditing: "off",
    messageDeletion: "admin",
    allowExport: true,
    moderationEnabled: true,
  },

  /**
   * Activity feed - Read-only system notifications
   */
  system: {
    isGroup: false,
    threading: false,
    contextMode: "system",
    reactionEnabled: false,
    mentionEnabled: false,
    allowAttachments: false,
    messageEditing: "off",
    messageDeletion: "off",
    readReceipts: false,
    typingIndicator: false,
    pinMessageEnabled: false,
  },
};

/**
 * Merge partial config with defaults
 */
export function mergeConfig(
  partial: Partial<ChatConfig> = {}
): Required<ChatConfig> {
  // If contextMode is specified, start with its preset
  const preset = partial.contextMode
    ? CHAT_CONFIG_PRESETS[partial.contextMode] || {}
    : {};

  return {
    ...DEFAULT_CHAT_CONFIG,
    ...preset,
    ...partial,
  } as Required<ChatConfig>;
}

/**
 * Merge partial layout with defaults
 */
export function mergeLayout(
  partial: Partial<ChatLayout> = {}
): Required<ChatLayout> {
  return {
    ...DEFAULT_CHAT_LAYOUT,
    ...partial,
  };
}
