/**
 * Message formatting utilities
 * @module shared/chat/util/formatMessage
 */

import type { Message, UserMeta } from "../types/message";
import { truncate } from "@/frontend/shared/foundation/utils/core/format";

export { truncate };

/**
 * Format timestamp based on format preference
 */
export function formatTimestamp(
  timestamp: number,
  format: "relative" | "HH:mm" | "ISO" = "relative"
): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (format === "ISO") {
    return date.toISOString();
  }

  if (format === "HH:mm") {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Relative format
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Format user display name
 */
export function formatUserName(user: UserMeta): string {
  return user.name || `User ${user.id.slice(0, 6)}`;
}

/**
 * Extract mentions from message text
 * Returns array of user IDs
 */
export function extractMentions(text: string): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}

/**
 * Extract URLs from message text
 */
export function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
}

/**
 * Sanitize message text (basic XSS prevention)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Parse markdown-style formatting
 * Simple parser for **bold**, *italic*, `code`
 */
export function parseMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br />");
}

/**
 * Highlight mentions in text
 */
export function highlightMentions(
  text: string,
  currentUserId?: string
): string {
  return text.replace(/@(\w+)/g, (match, userId) => {
    const isSelf = userId === currentUserId;
    const className = isSelf ? "mention-self" : "mention";
    return `<span class="${className}">${match}</span>`;
  });
}


/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Get message preview (first line or truncated)
 */
export function getMessagePreview(message: Message, maxLength = 100): string {
  const text = message.content.text || message.content.markdown || "";
  const firstLine = text.split("\n")[0];
  return truncate(firstLine, maxLength);
}

/**
 * Check if message is edited
 */
export function isEdited(message: Message): boolean {
  return !!message.editedAt && message.editedAt > message.createdAt;
}

/**
 * Check if message is deleted
 */
export function isDeleted(message: Message): boolean {
  return !!message.deletedAt;
}

/**
 * Check if message is system message
 */
export function isSystemMessage(message: Message): boolean {
  return !!message.isSystem;
}

/**
 * Format reaction count
 */
export function formatReactionCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
  return `${(count / 1000000).toFixed(1)}m`;
}

/**
 * Group messages by date
 */
export function groupMessagesByDate(
  messages: Message[]
): Record<string, Message[]> {
  const grouped: Record<string, Message[]> = {};

  messages.forEach((msg) => {
    const date = new Date(msg.createdAt);
    const dateKey = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(msg);
  });

  return grouped;
}

/**
 * Check if two messages should be grouped (same author, close timestamps)
 */
export function shouldGroupMessages(
  msg1: Message,
  msg2: Message,
  thresholdMs = 60000
): boolean {
  return (
    msg1.author.id === msg2.author.id &&
    Math.abs(msg1.createdAt - msg2.createdAt) < thresholdMs
  );
}
