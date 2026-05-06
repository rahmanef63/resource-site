/**
 * Shared Communication Utilities
 * Common utilities for both Chat and AI features
 * @module shared/communications/utils
 */

// ============================================================================
// Re-export from formatMessage.ts (DRY)
// ============================================================================
export {
  formatTimestamp,
  formatUserName,
  extractMentions,
  extractUrls,
  sanitizeText,
  parseMarkdown,
  highlightMentions,
  truncate,
  formatFileSize,
  getMessagePreview,
  isEdited,
  isDeleted,
  isSystemMessage,
  formatReactionCount,
  groupMessagesByDate,
  shouldGroupMessages,
} from './chat/util/formatMessage';

// ============================================================================
// Re-export from id.ts (DRY)
// ============================================================================
export {
  generateId,
  generateMessageId,
  generateRoomId,
  generateAttachmentId,
  generateThreadId,
  parseIdType,
  isValidId,
  createCompositeKey,
  parseCompositeKey,
} from './chat/util/id';

// ============================================================================
// Additional shared utilities
// ============================================================================

/**
 * Get user initials from name
 * Used by both Chat and AI for avatars
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

import { truncate } from "@/frontend/shared/foundation/utils/core/format";

/**
 * Truncate text with ellipsis (communications default: 50 chars)
 */
export function truncateText(text: string, maxLength = 50): string {
  return truncate(text, maxLength);
}

/**
 * Truncate message (alias for truncateText)
 */
export function truncateMessage(text: string, maxLength = 50): string {
  return truncate(text, maxLength);
}

/**
 * Validate message content
 */
export function validateMessage(message: string, maxLength = 4000): { isValid: boolean; error?: string } {
  if (!message.trim()) {
    return { isValid: false, error: "Message cannot be empty" };
  }

  if (message.length > maxLength) {
    return { isValid: false, error: `Message is too long (max ${maxLength} characters)` };
  }

  return { isValid: true };
}

/**
 * Extract topic from message (AI-specific but could be used for chat categorization)
 */
export function extractTopicFromMessage(message: string): string {
  const keywords = {
    Programming: ["code", "javascript", "python", "react", "api", "function", "variable"],
    Cooking: ["recipe", "cook", "ingredient", "food", "meal", "kitchen"],
    Travel: ["travel", "trip", "vacation", "hotel", "flight", "destination"],
    Fitness: ["workout", "exercise", "gym", "fitness", "health", "training"],
    Education: ["learn", "study", "school", "university", "course", "education"],
    Business: ["business", "marketing", "sales", "strategy", "company", "profit"],
    Creative: ["design", "art", "creative", "writing", "music", "drawing"],
  };

  const lowerMessage = message.toLowerCase();

  for (const [topic, words] of Object.entries(keywords)) {
    if (words.some((word) => lowerMessage.includes(word))) {
      return topic;
    }
  }

  return "General";
}

/**
 * Generate conversation/session title from first message
 */
export function generateConversationTitle(firstMessage: string, maxWords = 6): string {
  const words = firstMessage.split(" ").slice(0, maxWords);
  return words.join(" ") + (firstMessage.split(" ").length > maxWords ? "..." : "");
}

/**
 * Check if file is image by extension
 */
export function isImageFile(fileName: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
  const extension = fileName.split(".").pop()?.toLowerCase();
  return imageExtensions.includes(extension || "");
}

/**
 * Check if file is video by extension
 */
export function isVideoFile(fileName: string): boolean {
  const videoExtensions = ["mp4", "mov", "avi", "mkv", "webm"];
  const extension = fileName.split(".").pop()?.toLowerCase();
  return videoExtensions.includes(extension || "");
}

/**
 * Check if file is audio by extension
 */
export function isAudioFile(fileName: string): boolean {
  const audioExtensions = ["mp3", "wav", "ogg", "m4a", "aac"];
  const extension = fileName.split(".").pop()?.toLowerCase();
  return audioExtensions.includes(extension || "");
}

/**
 * Format message time (short format for lists)
 */
export function formatMessageTime(timestamp: number | string | Date): string {
  const date = typeof timestamp === "number" 
    ? new Date(timestamp) 
    : typeof timestamp === "string" 
      ? new Date(timestamp) 
      : timestamp;
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
