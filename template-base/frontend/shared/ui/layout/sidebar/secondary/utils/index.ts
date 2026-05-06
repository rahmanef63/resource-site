/**
 * Secondary Sidebar Utilities
 * Shared utilities for list views in secondary sidebars (Chat, AI, etc.)
 */

import { truncate } from "@/frontend/shared/foundation/utils/core/format";

/**
 * Truncate text to fit within the secondary sidebar
 * Default is optimized for the 320px sidebar width
 */
export function truncateMessage(text: string, maxLength = 35): string {
  if (!text) return "";
  return truncate(text, maxLength);
}

/**
 * Format timestamp to relative time for sidebar display
 * Shows: "Just now", "2m", "1h", "Yesterday", "Mon", "Dec 1"
 */
export function formatSidebarTimestamp(timestamp: number | string | Date): string {
  const date = typeof timestamp === "number" 
    ? new Date(timestamp) 
    : typeof timestamp === "string" 
      ? new Date(timestamp) 
      : timestamp;
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  // Less than 1 minute
  if (minutes < 1) return "Just now";
  
  // Less than 1 hour - show minutes
  if (minutes < 60) return `${minutes}m`;
  
  // Less than 24 hours - show hours
  if (hours < 24) return `${hours}h`;
  
  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }
  
  // Within the last week - show day name
  if (days < 7) {
    return date.toLocaleDateString(undefined, { weekday: "short" });
  }
  
  // Same year - show month and day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  
  // Different year - include year
  return date.toLocaleDateString(undefined, { 
    month: "short", 
    day: "numeric", 
    year: "2-digit" 
  });
}

/**
 * Format a full timestamp for tooltips or details
 */
export function formatFullTimestamp(timestamp: number | string | Date): string {
  const date = typeof timestamp === "number" 
    ? new Date(timestamp) 
    : typeof timestamp === "string" 
      ? new Date(timestamp) 
      : timestamp;
  
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
