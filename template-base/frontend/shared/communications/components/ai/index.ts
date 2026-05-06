/**
 * AI Components for Conversational AI
 * 
 * Inspired by shadcn.io AI Elements - React components for building
 * ChatGPT-style interfaces with TypeScript support and shadcn/ui design.
 * 
 * @see https://www.shadcn.io/ai
 * 
 * These components are designed specifically for AI chat patterns:
 * - Streaming responses
 * - Tool calls
 * - Reasoning blocks
 * - Citations
 * - Branching conversations
 * 
 * @example
 * ```tsx
 * import { 
 *   Message, MessageContent, MessageAvatar,
 *   Response,
 *   Conversation, ConversationContent,
 *   PromptInput, PromptInputTextarea, PromptInputSubmit
 * } from '@/frontend/shared/communications/components/ai'
 * 
 * export function Chat() {
 *   const { messages, append, status } = useChat()
 *   
 *   return (
 *     <Conversation>
 *       <ConversationContent>
 *         {messages.map((message) => (
 *           <Message from={message.role} key={message.id}>
 *             <MessageAvatar src={message.role === 'user' ? '/user.jpg' : ''} name={message.role} />
 *             <MessageContent>
 *               <Response>{message.content}</Response>
 *             </MessageContent>
 *           </Message>
 *         ))}
 *       </ConversationContent>
 *     </Conversation>
 *   )
 * }
 * ```
 */

// Message - Chat message containers with role-based styling
export {
  Message,
  MessageContent,
  MessageAvatar,
  useMessage,
  type MessageProps,
  type MessageContentProps,
  type MessageAvatarProps,
  type MessageRole,
} from './message'

// Response - Streaming-optimized markdown renderer
export {
  Response,
  parseIncompleteMarkdownContent,
  type ResponseProps,
} from './response'

// Conversation - Auto-scrolling chat containers
export {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  useConversation,
  type ConversationProps,
  type ConversationContentProps,
  type ConversationScrollButtonProps,
} from './conversation'

// PromptInput - Auto-resizing textarea with toolbar
export {
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
  type PromptInputProps,
  type PromptInputTextareaProps,
  type PromptInputToolbarProps,
  type PromptInputToolsProps,
  type PromptInputButtonProps,
  type PromptInputSubmitProps,
  type PromptInputAttachButtonProps,
  type PromptInputAttachmentsProps,
  type PromptInputModelSelectProps,
  type ChatStatus,
  type Attachment,
} from './prompt-input'

// Actions - Interactive action buttons for AI responses
export {
  Actions,
  Action,
  type ActionsProps,
  type ActionProps,
} from './actions'

// Tool - Collapsible tool execution display with status tracking
export {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
  type ToolProps,
  type ToolHeaderProps,
  type ToolContentProps,
  type ToolInputProps,
  type ToolOutputProps,
  type ToolState,
} from './tool'

// Reasoning - Collapsible AI reasoning display
export {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
  type ReasoningProps,
  type ReasoningTriggerProps,
  type ReasoningContentProps,
} from './reasoning'

// Sources - Collapsible source citations
export {
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
  type SourcesProps,
  type SourcesTriggerProps,
  type SourcesContentProps,
  type SourceProps,
} from './sources'

// Suggestion - Scrollable suggestion pills
export {
  Suggestions,
  Suggestion,
  type SuggestionsProps,
  type SuggestionProps,
} from './suggestion'

// Branch - Response variation navigation
export {
  Branch,
  BranchMessages,
  BranchSelector,
  BranchPrevious,
  BranchNext,
  BranchPage,
  useBranch,
  type BranchProps,
  type BranchMessagesProps,
  type BranchSelectorProps,
  type BranchNavigationProps,
  type BranchPageProps,
} from './branch'

// CodeBlock - Syntax-highlighted code blocks
export {
  CodeBlock,
  CodeBlockCopyButton,
  type CodeBlockProps,
  type CodeBlockCopyButtonProps,
} from './code-block'

// Loader - Animated loader for AI streaming
export {
  Loader,
  type LoaderProps,
} from './loader'

// Image - AI-generated image display
export {
  Image,
  type ImageProps,
} from './image'

// InlineCitation - Inline citations with hover previews
export {
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
  type InlineCitationProps,
  type InlineCitationTextProps,
  type InlineCitationCardProps,
  type InlineCitationCardTriggerProps,
  type InlineCitationCardBodyProps,
  type InlineCitationCarouselProps,
  type InlineCitationCarouselHeaderProps,
  type InlineCitationCarouselIndexProps,
  type InlineCitationCarouselContentProps,
  type InlineCitationCarouselItemProps,
  type InlineCitationSourceProps,
  type InlineCitationQuoteProps,
} from './inline-citation'

// Task - AI task workflow display
export {
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
  type TaskProps,
  type TaskTriggerProps,
  type TaskContentProps,
  type TaskItemProps,
  type TaskItemFileProps,
} from './task'

// WebPreview - Live iframe preview for AI-generated UIs
export {
  WebPreview,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  WebPreviewBody,
  WebPreviewConsole,
  type WebPreviewProps,
  type WebPreviewNavigationProps,
  type WebPreviewNavigationButtonProps,
  type WebPreviewUrlProps,
  type WebPreviewBodyProps,
  type WebPreviewConsoleProps,
  type ConsoleLog,
} from './web-preview'

// Shimmer - Text shimmer loading animation
export {
  Shimmer,
  type ShimmerProps,
} from './shimmer'

// ChainOfThought - Collapsible AI reasoning display
export {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
  ChainOfThoughtSearchResults,
  ChainOfThoughtSearchResult,
  ChainOfThoughtContent,
  ChainOfThoughtImage,
  type ChainOfThoughtProps,
  type ChainOfThoughtHeaderProps,
  type ChainOfThoughtStepProps,
  type ChainOfThoughtSearchResultsProps,
  type ChainOfThoughtSearchResultProps,
  type ChainOfThoughtContentProps,
  type ChainOfThoughtImageProps,
} from './chain-of-thought'

// ModelSelector - AI model selection dialog
export {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorDialog,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorShortcut,
  ModelSelectorSeparator,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  type ModelSelectorProps,
  type ModelSelectorTriggerProps,
  type ModelSelectorContentProps,
  type ModelSelectorDialogProps,
  type ModelSelectorInputProps,
  type ModelSelectorListProps,
  type ModelSelectorEmptyProps,
  type ModelSelectorGroupProps,
  type ModelSelectorItemProps,
  type ModelSelectorShortcutProps,
  type ModelSelectorSeparatorProps,
  type ModelSelectorLogoProps,
  type ModelSelectorLogoGroupProps,
  type ModelSelectorNameProps,
  type ProviderName,
} from './model-selector'
