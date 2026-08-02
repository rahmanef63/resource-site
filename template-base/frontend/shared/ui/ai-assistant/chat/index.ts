/**
 * Agent Chat Components
 * 
 * Shared, dynamic AI chat container for use across all features.
 * Provides consistent UI/UX with the AI feature's chat interface.
 * 
 * @example
 * ```tsx
 * import { AgentChatContainer } from "@/frontend/shared/ui/ai-assistant/chat"
 * 
 * // Full 3-column layout
 * <AgentChatContainer 
 *   featureId="documents"
 *   showRecentChats={true}
 *   showDebugPanel={true}
 * />
 * 
 * // Compact panel variant
 * <AgentChatContainer 
 *   featureId="documents"
 *   variant="compact"
 * />
 * ```
 */

// Main container
export { AgentChatContainer } from "./AgentChatContainer"

// Sub-components
export { RecentChatsPanel } from "./RecentChatsPanel"

// Store
export { 
  useAgentChatStore,
  selectCurrentSession,
  selectMessages,
  selectIsLoading,
  selectIsSending,
  selectRecentChats,
} from "./store"

// Types
export type {
  ChatMessage,
  ChatSession,
  RecentChatItem,
  AgentInfo,
  AgentChatContainerProps,
  RecentChatsPanelProps,
  ChatInputAreaProps,
  MessageListProps,
  ToolCallInfo,
  AttachmentInfo,
  UseAgentChatReturn,
} from "./types"
