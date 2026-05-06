/**
 * AI Feature Utilities
 * Re-exports shared utilities and adds AI-specific helpers
 */

import type { AIConversation } from "../types"

// Re-export shared utilities (DRY)
export {
  generateId,
  formatTimestamp,
  truncateText,
  extractTopicFromMessage,
  generateConversationTitle,
  validateMessage,
} from "@/frontend/shared/communications"

// Re-export error handling utilities
export {
  parseAIError,
  formatErrorForToast,
  PROVIDER_KEY_URLS,
  PROVIDER_NAMES,
  type ParsedAIError,
} from "./error-handler"

/**
 * Search conversations by title, topic, or message content
 * AI-specific utility
 */
export const searchConversations = (conversations: AIConversation[], query: string): AIConversation[] => {
  if (!query.trim()) return conversations

  const lowerQuery = query.toLowerCase()

  return conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(lowerQuery) ||
      conv.topic.toLowerCase().includes(lowerQuery) ||
      conv.messages.some((msg) => msg.text.toLowerCase().includes(lowerQuery)),
  )
}
