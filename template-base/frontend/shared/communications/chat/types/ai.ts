/**
 * AI Chat Types
 * Extends base chat types with AI-specific functionality
 * @module shared/chat/types/ai
 */

import type { ChatContextMode, ChatConfig, ChatLayout } from "./config";
import type { Message, MessageContent, MessageDraft, UserMeta, Paginated } from "./message";
import type { ChatRoomRef, RoomMeta } from "./chat";
import type { Id } from "@/convex/_generated/dataModel";

// ============================================================================
// AI Message Types
// ============================================================================

/**
 * AI Message role
 */
export type AIRole = "user" | "assistant" | "system";

/**
 * AI Message extends base message with AI-specific fields
 */
export interface AIMessage extends Omit<Message, "author"> {
  role: AIRole;
  author: UserMeta & {
    isBot?: boolean;
    botType?: AIBotType;
  };
  metadata?: AIMessageMetadata;
  isStreaming?: boolean;
  streamContent?: string;
}

/**
 * AI Message metadata
 */
export interface AIMessageMetadata {
  tokenCount?: number;
  promptTokens?: number;
  completionTokens?: number;
  model?: string;
  contextIds?: string[];
  knowledgeSources?: string[];
  processingTime?: number;
  finishReason?: "stop" | "length" | "content_filter" | "error";
  error?: string;
}

/**
 * AI Message draft (user sending)
 */
export interface AIMessageDraft extends MessageDraft {
  knowledgeContext?: AIKnowledgeContext;
  systemPrompt?: string;
}

// ============================================================================
// AI Session Types
// ============================================================================

/**
 * AI Chat Session — chat-integration variant that embeds the chat Message model.
 * This is DIFFERENT from `shared/ai/stores/index.ts:AISession` (AI feature store type).
 * Note: workspaceId can be either Id<"workspaces"> or string for flexibility
 * between Convex and frontend representations.
 */
export interface AISession {
  _id: Id<"aiChatSessions"> | string;
  workspaceId?: Id<"workspaces"> | string;
  userId: string;
  title: string;
  isGlobal?: boolean;
  messages: AIMessage[];
  status: "active" | "archived";
  model?: string;
  settings?: AISettings;
  createdAt: number;
  updatedAt: number;
}

/**
 * AI Settings
 */
export interface AISettings {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

/**
 * Default AI Settings
 */
export const DEFAULT_AI_SETTINGS: AISettings = {
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 4096,
  systemPrompt: "You are a helpful AI assistant.",
};

// ============================================================================
// AI Bot Types
// ============================================================================

/**
 * AI Bot type
 */
export type AIBotType = "assistant" | "workflow" | "gpt" | "claude" | "custom";

/**
 * AI Bot configuration
 */
export interface AIBotConfig {
  id: string;
  name: string;
  type: AIBotType;
  avatarUrl?: string;
  description?: string;
  capabilities?: AICapability[];
  settings?: AISettings;
}

/**
 * AI Capability
 */
export type AICapability =
  | "text"
  | "code"
  | "image_generation"
  | "image_analysis"
  | "file_analysis"
  | "web_search"
  | "knowledge_base";

// ============================================================================
// AI Knowledge/Context Types
// ============================================================================

/**
 * Knowledge source type
 * Includes all possible knowledge sources from different contexts
 */
export type KnowledgeSourceType = 
  | "wiki"           // Wiki pages / Knowledge Base
  | "documents"      // General documents
  | "files"          // File attachments
  | "web"            // Web search results
  | "custom"         // Custom documents
  | "posts"          // Blog posts / articles
  | "portfolio"      // Portfolio items
  | "services"       // Services offered
  | "products"       // Products catalog
  | "pages";         // CMS Pages

/**
 * AI Knowledge context
 */
export interface AIKnowledgeContext {
  enabled: boolean;
  sources: KnowledgeSourceType[];
  documents?: Array<{
    id: string;
    title: string;
    content?: string;
  }>;
  customContext?: string;
}

// ============================================================================
// AI Store Types
// ============================================================================

/**
 * AI Store state
 */
export interface AIStoreState {
  // State
  workspaceId: Id<"workspaces"> | null;
  userId: string | null;
  sessions: AISession[];
  selectedSessionId: Id<"aiChatSessions"> | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  globalMode: boolean;
  
  // Knowledge
  knowledgeEnabled: boolean;
  selectedKnowledgeSources: KnowledgeSourceType[];
  
  // Computed
  selectedSession: AISession | null;
}

/**
 * AI Store actions
 */
export interface AIStoreActions {
  init: (workspaceId: Id<"workspaces"> | null, userId: string | null) => void;
  setSessions: (sessions: AISession[]) => void;
  setSelectedSession: (sessionId: Id<"aiChatSessions"> | null) => void;
  setLoading: (loading: boolean) => void;
  setSending: (sending: boolean) => void;
  setError: (error: string | null) => void;
  setGlobalMode: (global: boolean) => void;
  setKnowledgeEnabled: (enabled: boolean) => void;
  setKnowledgeSources: (sources: KnowledgeSourceType[]) => void;
  
  addSession: (session: AISession) => void;
  updateSession: (sessionId: Id<"aiChatSessions">, updates: Partial<AISession>) => void;
  removeSession: (sessionId: Id<"aiChatSessions">) => void;
  addMessage: (sessionId: Id<"aiChatSessions">, message: AIMessage) => void;
  reset: () => void;
}

// ============================================================================
// AI Data Source
// ============================================================================

/**
 * AI Data source abstraction
 */
export interface AIDataSource {
  // Session operations
  listSessions: (params: {
    workspaceId?: Id<"workspaces">;
    userId: string;
    status?: "active" | "archived";
    global?: boolean;
  }) => Promise<AISession[]>;
  
  getSession: (sessionId: Id<"aiChatSessions">) => Promise<AISession | null>;
  
  createSession: (params: {
    workspaceId?: Id<"workspaces">;
    userId: string;
    title: string;
    isGlobal?: boolean;
    settings?: AISettings;
  }) => Promise<AISession>;
  
  updateSession: (
    sessionId: Id<"aiChatSessions">,
    updates: Partial<AISession>
  ) => Promise<AISession>;
  
  archiveSession: (sessionId: Id<"aiChatSessions">) => Promise<void>;
  deleteSession: (sessionId: Id<"aiChatSessions">) => Promise<void>;
  
  // Message operations
  sendMessage: (
    sessionId: Id<"aiChatSessions">,
    draft: AIMessageDraft
  ) => Promise<AIMessage>;
  
  regenerateResponse: (
    sessionId: Id<"aiChatSessions">,
    messageId: string
  ) => Promise<AIMessage>;
}

// ============================================================================
// AI Config (extends ChatConfig)
// ============================================================================

/**
 * AI Context Mode (extends ChatContextMode)
 */
export type AIContextMode = "ai" | ChatContextMode;

/**
 * AI Chat configuration
 */
export interface AIConfig {
  // Inherited from ChatConfig
  isGroup?: boolean;
  threading?: boolean;
  reactionEnabled?: boolean;
  mentionEnabled?: boolean;
  readReceipts?: boolean;
  typingIndicator?: boolean;
  messageEditing?: "off" | "author" | "admin";
  messageDeletion?: "off" | "author" | "admin" | "hard";
  maxMessageLength?: number;
  autoScroll?: boolean;
  allowAttachments?: boolean;
  maxAttachmentSizeMB?: number;
  linkPreview?: boolean;
  imagePreview?: boolean;
  
  // AI-specific settings
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  
  // Knowledge base
  knowledgeEnabled?: boolean;
  knowledgeSources?: KnowledgeSourceType[];
  
  // AI Commands
  aiCommands?: string[];
  
  // Streaming
  streamingEnabled?: boolean;
  
  // Context mode
  contextMode?: AIContextMode;
}

/**
 * AI Layout (extends ChatLayout)
 */
export interface AILayout extends Partial<ChatLayout> {
  // AI-specific layout
  showKnowledgeSelector?: boolean;
  showModelSelector?: boolean;
  showTokenCount?: boolean;
}

// ============================================================================
// AI Hooks Types
// ============================================================================

/**
 * UseAI options
 */
export interface UseAIOptions {
  workspaceId?: Id<"workspaces"> | null;
  userId?: string;
  sessionId?: Id<"aiChatSessions">;
  config?: AIConfig;
}

/**
 * UseAI return type
 */
export interface UseAIReturn {
  // State
  session: AISession | null;
  messages: AIMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (text: string, context?: AIKnowledgeContext) => Promise<void>;
  createSession: (title: string) => Promise<AISession | null>;
  selectSession: (sessionId: Id<"aiChatSessions"> | null) => void;
  regenerate: (messageId: string) => Promise<void>;
  clearSession: () => void;
}

// ============================================================================
// AI Events
// ============================================================================

/**
 * AI Events
 */
export interface AIEvents {
  onSessionCreate?: (session: AISession) => void;
  onSessionSelect?: (sessionId: Id<"aiChatSessions"> | null) => void;
  onMessageSend?: (message: AIMessageDraft) => void;
  onMessageReceive?: (message: AIMessage) => void;
  onCommand?: (command: string, args: string[]) => void;
  onError?: (error: Error) => void;
  onStreamStart?: () => void;
  onStreamEnd?: () => void;
  onStreamChunk?: (chunk: string) => void;
}

// ============================================================================
// AI List/Detail View Props
// ============================================================================

/**
 * AI List View Props
 */
export interface AIListViewProps {
  selectedSessionId?: Id<"aiChatSessions">;
  onSessionSelect?: (sessionId: Id<"aiChatSessions">) => void;
  variant?: "standalone" | "layout";
  className?: string;
}

/**
 * AI Detail View Props
 */
export interface AIDetailViewProps {
  sessionId?: Id<"aiChatSessions">;
  config?: AIConfig;
  layout?: AILayout;
  events?: AIEvents;
  className?: string;
}

/**
 * AI Container Props (main component)
 */
export interface AIContainerProps {
  workspaceId?: Id<"workspaces"> | null;
  sessionId?: Id<"aiChatSessions">;
  bot?: AIBotConfig;
  config?: AIConfig;
  layout?: AILayout;
  events?: AIEvents;
  className?: string;
}
