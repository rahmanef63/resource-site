/**
 * Communications Components
 * Re-exports all components from chat subdomain and AI components
 */

// Chat Components (existing chat feature)
export { ChatInput } from '../chat/components/ChatInput'
export { ChatContainer as LegacyChatContainer } from '../chat/components/ChatContainer'
export { ChatHeader } from '../chat/components/ChatHeader'
export { ChatMessage } from '../chat/components/ChatMessage'
export { ChatSidebar } from '../chat/components/ChatSidebar'
export { ChatThread } from '../chat/components/ChatThread'
export { ChatComposer } from '../chat/components/ChatComposer'
export { ActivityFeed } from '../chat/components/ActivityFeed'

// ============================================================
// Grok-style AI Chat Components
// Modern, minimal AI chat UI inspired by X/Grok
// ============================================================
export {
  GrokUserMessage,
  GrokAIMessage,
  GrokTypingIndicator,
  GrokChatContainer,
  GrokInput,
  type GrokMessageProps,
  type GrokChatContainerProps,
  type GrokInputProps,
} from './grok-chat'

// ============================================================
// Rich Text Rendering
// ============================================================
export { RichTextRenderer, type RichTextBlock, type RichTextBlockType, type RichTextRendererProps } from './RichTextRenderer'

// ============================================================
// AI Components (shadcn.io AI Elements style)
// ============================================================
export * from './ai'
