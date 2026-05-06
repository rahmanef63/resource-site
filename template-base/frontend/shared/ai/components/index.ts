/**
 * Canonical embedded AI UI surface.
 */

export { AgentSelector } from "./AgentSelector";
export { ChatHistoryDropdown } from "./ChatHistoryDropdown";

export * from "@/frontend/shared/ui/ai-assistant";
export {
  AgentChatContainer,
  RecentChatsPanel,
} from "@/frontend/shared/ui/ai-assistant/chat";

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
} from "@/frontend/shared/ui/ai-assistant/chat";
