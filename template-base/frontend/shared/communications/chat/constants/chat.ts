/**
 * Chat system constants
 * @module shared/chat/constants/chat
 */

export const CHAT_CONSTANTS = {
  // Message limits
  MAX_MESSAGE_LENGTH_DEFAULT: 10000,
  MAX_MESSAGE_LENGTH_SHORT: 500,
  MAX_MESSAGE_LENGTH_LONG: 50000,

  // Attachment limits
  MAX_ATTACHMENT_SIZE_MB_DEFAULT: 10,
  MAX_ATTACHMENT_SIZE_MB_LARGE: 50,
  MAX_ATTACHMENTS_PER_MESSAGE: 10,

  // Pagination
  MESSAGES_PER_PAGE: 50,
  MESSAGES_INITIAL_LOAD: 30,

  // Timing
  TYPING_INDICATOR_TIMEOUT_MS: 3000,
  TYPING_DEBOUNCE_MS: 500,
  PRESENCE_UPDATE_INTERVAL_MS: 30000,
  MESSAGE_EDIT_TIMEOUT_MINUTES: 15,

  // UI
  SCROLL_THRESHOLD_PX: 100,
  VIRTUAL_LIST_ITEM_HEIGHT: 80,
  SIDEBAR_WIDTH_PX: 300,

  // Reactions
  MAX_REACTIONS_PER_MESSAGE: 50,
  COMMON_EMOJIS: ["👍", "❤️", "😂", "😮", "😢", "🙏", "👏", "🔥"],

  // Search
  SEARCH_DEBOUNCE_MS: 300,
  SEARCH_MIN_LENGTH: 2,

  // Cache
  ROOM_CACHE_TTL_MS: 300000, // 5 minutes
  MESSAGE_CACHE_SIZE: 1000,
} as const;

export const MESSAGE_ACTIONS = {
  SEND: "send",
  EDIT: "edit",
  DELETE: "delete",
  PIN: "pin",
  UNPIN: "unpin",
  REACT: "react",
  REPLY: "reply",
  FORWARD: "forward",
  QUOTE: "quote",
} as const;

export const SYSTEM_COMMANDS = {
  HELP: "/help",
  ME: "/me",
  GPT: "/gpt",
  ASSIGN: "/assign",
  RENAME: "/rename",
  TOPIC: "/topic",
  EXPORT: "/export",
  INVITE: "/invite",
  LEAVE: "/leave",
  MUTE: "/mute",
  UNMUTE: "/unmute",
} as const;

export const ATTACHMENT_MIME_TYPES = {
  IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  VIDEO: ["video/mp4", "video/webm", "video/ogg"],
  AUDIO: [
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
    "audio/aac",
    "audio/mp3",
  ],
  DOCUMENT: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
  ],
} as const;

export const ERROR_MESSAGES = {
  MESSAGE_TOO_LONG: "Message exceeds maximum length",
  FILE_TOO_LARGE: "File size exceeds limit",
  UPLOAD_FAILED: "Failed to upload file",
  PERMISSION_DENIED: "You don't have permission to perform this action",
  ROOM_NOT_FOUND: "Chat room not found",
  MESSAGE_NOT_FOUND: "Message not found",
  NETWORK_ERROR: "Network error, please try again",
  MODERATION_BLOCKED: "Message blocked by moderation",
} as const;
