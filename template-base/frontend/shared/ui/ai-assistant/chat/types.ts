/**
 * Agent Chat Types
 * 
 * Shared types for the dynamic Agent Chat Container.
 */

import type { Id } from "@/convex/_generated/dataModel"

// ============================================================================
// Message Types
// ============================================================================

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
  metadata?: {
    tokenCount?: number
    duration?: number
    model?: string
    agentId?: string
    toolCalls?: ToolCallInfo[]
    reasoning?: string
    attachments?: AttachmentInfo[]
    replyTo?: string
    [key: string]: any
  }
  feedback?: "up" | "down"
  isLoading?: boolean
}

export interface ToolCallInfo {
  id: string
  name: string
  params: Record<string, any>
  result?: any
  error?: string
  duration?: number
  status: "pending" | "success" | "error"
}

export interface AttachmentInfo {
  id: string
  name: string
  type: string
  url?: string
  size?: number
}

// ============================================================================
// Session Types
// ============================================================================

export interface ChatSession {
  _id: string
  id?: string
  title: string
  icon?: string
  topic?: string
  status: "active" | "archived" | string
  messages: ChatMessage[]
  createdAt: number
  updatedAt: number
  featureId?: string
  workspaceId?: string
  metadata?: {
    provider?: string
    model?: string
    temperature?: number
    agentId?: string
    [key: string]: any
  }
}

export interface RecentChatItem {
  _id: string
  title: string
  lastMessage?: string
  timestamp: number
  featureId?: string
  icon?: string
  messageCount?: number
}

// ============================================================================
// Agent Types
// ============================================================================

export interface AgentInfo {
  id: string
  name: string
  description: string
  featureId: string
  icon?: string
  tools: string[]
  capabilities?: string[]
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface AgentChatContainerProps {
  /** Feature ID for filtering agents (e.g., 'documents', 'tasks', 'ai') */
  featureId: string
  
  /** Current session ID */
  sessionId?: string
  
  /** Current session data */
  session?: ChatSession | null
  
  /** Callback when a new session is created */
  onSessionCreate?: (session: ChatSession) => void
  
  /** Callback when session is selected */
  onSessionSelect?: (sessionId: string) => void
  
  /** Custom placeholder text */
  placeholder?: string
  
  /** Context for the AI (e.g., selected document) */
  context?: Record<string, any>
  
  /** Enable/disable recent chats sidebar */
  showRecentChats?: boolean
  
  /** Enable/disable debug panel */
  showDebugPanel?: boolean
  
  /** Custom welcome message */
  welcomeMessage?: string
  
  /**
   * Custom suggestions for new chat. Accepts plain strings (legacy) or
   * full AgentSuggestion objects. When absent, falls back to
   * `subAgentRegistry.getSuggestions(featureId)` then to a minimal default.
   */
  suggestions?: string[] | import("@/frontend/shared/ai/agent/types").AgentSuggestion[]
  
  /** Additional className */
  className?: string
  
  /** Variant: full (3-column) or compact (single panel) */
  variant?: "full" | "compact" | "panel"
  
  /** Custom header component */
  headerComponent?: React.ReactNode
  
  /** Callback for message send — when set, replaces the default agent dispatch entirely. */
  onMessageSend?: (message: string, attachments?: File[]) => Promise<void>

  /**
   * Intercept the raw user input and return an enriched prompt to send to the agent.
   * The displayed user message is NOT rewritten — only the payload the agent sees.
   * Use for feature-specific prompt augmentation (e.g., content generation type tags).
   */
  onBeforeSend?: (raw: string) => string | Promise<string>

  /** Callback for message receive */
  onMessageReceive?: (message: ChatMessage) => void
  
  /** Enable knowledge context */
  knowledgeEnabled?: boolean
  
  /** Knowledge context string */
  knowledgeContext?: string
}

export interface RecentChatsPanelProps {
  featureId: string
  sessions: RecentChatItem[]
  selectedSessionId?: string
  onSessionSelect: (sessionId: string) => void
  onNewChat: () => void
  isLoading?: boolean
  className?: string
}

export interface ChatInputAreaProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  isLoading?: boolean
  attachments?: File[]
  onAttach?: (files: FileList) => void
  onRemoveAttachment?: (index: number) => void
  replyingTo?: string
  onCancelReply?: () => void
  suggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
  className?: string
}

export interface MessageListProps {
  messages: ChatMessage[]
  isLoading?: boolean
  isRegenerating?: boolean
  messageBranches?: Record<string, Array<{ id: string; content: string; timestamp: number }>>
  onRegenerate?: (messageId: string, content: string) => void
  onReply?: (content: string) => void
  onCopy?: (content: string) => void
  onListen?: (content: string) => void
  onThumbsUp?: (messageId: string) => void
  onThumbsDown?: (messageId: string) => void
  suggestions?: string[]
  onSuggestionClick?: (suggestion: string) => void
  className?: string
}

// ============================================================================
// Hook Types
// ============================================================================

export interface UseAgentChatReturn {
  // State
  messages: ChatMessage[]
  isLoading: boolean
  isSending: boolean
  error: string | null
  
  // Actions
  sendMessage: (content: string, attachments?: File[]) => Promise<void>
  regenerateMessage: (messageId: string) => Promise<void>
  clearChat: () => void
  
  // Session management
  currentSession: ChatSession | null
  createSession: (title?: string) => Promise<ChatSession | null>
  selectSession: (sessionId: string) => void
  
  // Recent chats
  recentChats: RecentChatItem[]
  
  // Debug
  debugState: {
    agentTraces: any[]
    toolCallTraces: any[]
    logs: any[]
  }
}
