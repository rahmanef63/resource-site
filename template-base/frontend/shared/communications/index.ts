/**
 * Communications Domain Facade
 *
 * Real-time communication features including:
 * - Chat system (messages, channels, threads)
 * - AI Elements (ChatGPT-style components)
 * - Shared conversation components (context menu, dialogs, list cards)
 *
 * @example
 * import { useChat, ChatContainer } from '@/frontend/shared/communications'
 * import { Message, Response, PromptInput } from '@/frontend/shared/communications'
 */

// ============================================================
// Shared Conversation Components (DRY - used by Chat, AI, etc.)
// ============================================================
export * from './conversation'

// ============================================================
// Chat System
// ============================================================
export * from './chat'
// Chat components
export { ChatInput } from './chat/components/ChatInput'
export { ChatContainer } from './chat/components/ChatContainer'
export { ChatHeader } from './chat/components/ChatHeader'
export { ChatMessage } from './chat/components/ChatMessage'
export { ChatSidebar } from './chat/components/ChatSidebar'
export { ChatThread } from './chat/components/ChatThread'
export { ChatComposer } from './chat/components/ChatComposer'
export { ActivityFeed as ChatActivityFeed } from './chat/components/ActivityFeed'
// Chat hooks
export { useChat } from './chat/hooks/useChat'
export { useChatPresence } from './chat/hooks/useChatPresence'
export { useChatScroll } from './chat/hooks/useChatScroll'
export { useMessageActions } from './chat/hooks/useMessageActions'
// AI Hooks (still in chat folder for now)
export { useAI } from './chat/hooks/useAI'
export { useAIStoreBase, createAIStore, aiStoreSelectors } from './chat/hooks/useAIStore'

// ============================================================
// AI Elements Components (shadcn.io/ai style)
// ChatGPT-style interface components - shared between AI and Chat
// ============================================================
export {
  // Message - Chat message containers with role-based styling
  Message,
  MessageContent,
  MessageAvatar,
  useMessage,
  // Response - Streaming-optimized markdown renderer
  Response,
  parseIncompleteMarkdownContent,
  // Conversation - Auto-scrolling chat containers
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  useConversation,
  // PromptInput - Auto-resizing textarea with toolbar
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputAttachButton,
  PromptInputAttachments,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
  usePromptInput,
  // Actions - Interactive action buttons
  Actions,
  Action,
  // Tool - Collapsible tool execution display
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
  // Reasoning - Collapsible AI reasoning display
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
  // Sources - Collapsible source citations
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
  // Suggestion - Scrollable suggestion pills
  Suggestions,
  Suggestion,
  // Branch - Response variation navigation
  Branch,
  BranchMessages,
  BranchSelector,
  BranchPrevious,
  BranchNext,
  BranchPage,
  useBranch,
  // CodeBlock - Syntax-highlighted code blocks
  CodeBlock,
  CodeBlockCopyButton,
  // Loader - Animated loader for AI streaming
  Loader,
  // Image - AI-generated image display
  Image,
  // InlineCitation - Inline citations with hover previews
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationSource,
  InlineCitationQuote,
  // Task - AI task workflow display
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
  // WebPreview - Live iframe preview for AI-generated UIs
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
} from './components/ai'

// AI Elements Types
export type {
  MessageRole,
  MessageProps,
  MessageContentProps,
  MessageAvatarProps,
  ResponseProps,
  ConversationProps,
  ConversationContentProps,
  ConversationScrollButtonProps,
  PromptInputProps,
  PromptInputTextareaProps,
  PromptInputToolbarProps,
  PromptInputToolsProps,
  PromptInputButtonProps,
  PromptInputSubmitProps,
  PromptInputAttachButtonProps,
  PromptInputAttachmentsProps,
  PromptInputModelSelectProps,
  ChatStatus,
  Attachment,
  ActionsProps,
  ActionProps,
  ToolProps,
  ToolHeaderProps,
  ToolContentProps,
  ToolInputProps,
  ToolOutputProps,
  ToolState,
  ReasoningProps,
  ReasoningTriggerProps,
  ReasoningContentProps,
  SourcesProps,
  SourcesTriggerProps,
  SourcesContentProps,
  SourceProps,
  SuggestionsProps,
  SuggestionProps,
  BranchProps,
  BranchMessagesProps,
  BranchSelectorProps,
  BranchNavigationProps,
  BranchPageProps,
  CodeBlockProps,
  CodeBlockCopyButtonProps,
  LoaderProps,
  ImageProps,
  InlineCitationProps,
  InlineCitationTextProps,
  InlineCitationCardProps,
  InlineCitationCardTriggerProps,
  InlineCitationCardBodyProps,
  InlineCitationCarouselProps,
  InlineCitationCarouselHeaderProps,
  InlineCitationCarouselIndexProps,
  InlineCitationCarouselContentProps,
  InlineCitationCarouselItemProps,
  InlineCitationSourceProps,
  InlineCitationQuoteProps,
  TaskProps,
  TaskTriggerProps,
  TaskContentProps,
  TaskItemProps,
  TaskItemFileProps,
  WebPreviewProps,
  WebPreviewNavigationProps,
  WebPreviewNavigationButtonProps,
  WebPreviewUrlProps,
  WebPreviewBodyProps,
  WebPreviewConsoleProps,
  ConsoleLog,
} from './components/ai'

// ============================================================
// Types
// ============================================================
export type {
  // Chat types
  Message as ChatMessageType,
  MessageContent as ChatMessageContent,
  MessageDraft,
  UserMeta,
  Attachment as ChatAttachment,
  Paginated,
} from './chat/types/message'

export type {
  ChatRoomRef,
  RoomMeta,
} from './chat/types/chat'

export type {
  ChatConfig,
  ChatLayout,
} from './chat/types/config'

// AI Types
export type {
  AIMessage,
  AISession,
  AIConfig,
  AIKnowledgeContext,
  KnowledgeSourceType,
} from './chat/types/ai'

// ============================================================================
// Shared Composer Components
// ============================================================================
export {
  ComposerBar,
  EmojiPicker,
  AttachmentMenu,
  SlashCommands,
  Mentions,
  UniversalComposer,
  DEFAULT_SLASH_COMMANDS,
  type ComposerContext,
  type ComposerConfig,
  type ComposerCallbacks,
  type ComposerAttachment,
  type AttachmentType,
  type SlashCommand,
  type SlashCommandCategory,
  type MentionItem,
  type MentionType,
  DEFAULT_COMPOSER_LABELS,
} from './composer'

// ============================================================================
// Shared Message Components
// ============================================================================
export {
  MessageBubble,
  MessageReactions,
  ExistingReactions,
  type BaseMessage,
  type MessageContext,
  type MessageBubbleCallbacks,
  type MessageStatus,
} from './message'

// ============================================================================
// Member Info Components (for member/contact detail views)
// ============================================================================
export {
  MemberInfoModal,
  MemberInfoDrawer,
  MemberInfoPanel,
  MemberInfoHeader,
  MemberInfoSidebar,
  MemberInfoContent,
  NavigationItem,
  MEMBER_INFO_SECTIONS,
  DEFAULT_MEMBER_INFO_SECTION,
  OverviewSection,
  MediaSection,
  FilesSection,
  LinksSection,
  EventsSection,
  EncryptionSection,
  GroupsSection,
  MemberDetailView,
} from './chat/components/member'
export type { MemberInfoSection, MemberInfoContact, MemberInfoDrawerProps, MemberInfoPanelProps } from './chat/components/member'
export type { MemberDetailViewProps } from './chat/components/member/MemberDetailView'

// ============================================================================
// Shared Utilities (DRY - used by Chat, AI, and other features)
// ============================================================================
export {
  // From formatMessage.ts
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
  // From id.ts
  generateId,
  generateMessageId,
  generateRoomId,
  generateAttachmentId,
  generateThreadId,
  parseIdType,
  isValidId,
  createCompositeKey,
  parseCompositeKey,
  // Additional shared utilities
  getInitials,
  truncateText,
  truncateMessage,
  validateMessage,
  extractTopicFromMessage,
  generateConversationTitle,
  isImageFile,
  isVideoFile,
  isAudioFile,
  formatMessageTime,
} from './utils'
