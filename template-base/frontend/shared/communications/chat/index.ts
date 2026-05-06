/**
 * Reusable Chat System
 * @module shared/chat
 *
 * A comprehensive, param-driven chat system for SuperSpace
 * Supports multiple contexts: comments, support, workspace, projects, documents, CRM, activity feeds
 */

// Main component
export { ChatContainer } from "./components/ChatContainer";
export type { ChatContainerProps } from "./components/ChatContainer";

// Sub-components
export { ChatHeader } from "./components/ChatHeader";
export { ChatSidebar } from "./components/ChatSidebar";
export { ChatThread } from "./components/ChatThread";
export { ChatMessage } from "./components/ChatMessage";
export { ChatInput } from "./components/ChatInput";
export { ChatComposer } from "./components/ChatComposer";
export { AttachmentButton } from "./components/AttachmentButton";
export { ReactionBar } from "./components/ReactionBar";
export { TypingIndicator } from "./components/TypingIndicator";
export { ReadReceipts } from "./components/ReadReceipts";
export { MediaGallery } from "./components/MediaGallery";
export { ActivityFeed } from "./components/ActivityFeed";
export {
  MemberInfoModal,
  MemberInfoHeader,
  MemberInfoSidebar,
  MemberInfoContent,
  MemberDetailView,
} from "./components/member";
export type {
  MemberInfoContact,
  MemberInfoSection,
} from "./components/member";

// Hooks
export { useChat } from "./hooks/useChat";
export type { UseChatOptions, UseChatReturn } from "./hooks/useChat";
export { useChatScroll } from "./hooks/useChatScroll";
export { useChatPresence } from "./hooks/useChatPresence";
export { useMessageActions } from "./hooks/useMessageActions";
export {
  useMemberInfo,
  useMemberProfile,
  useMemberActions,
  useIsMemberFavorite,
  useIsMemberBlocked,
  useSharedMedia,
  useSharedFiles,
  useSharedLinks,
  useCommonGroups,
} from "./hooks/useMemberActions";

// Adapters (Convex integration)
export {
  useConvexChatDataSource,
  useChatMessages,
  useChatRoom,
  useChatParticipants,
} from "./adapters";

// Lib
export {
  createConvexChatDataSource,
  createMockChatDataSource,
} from "./lib/chatClient";
export { MessageBus, globalMessageBus, createRoomMessageBus } from "./lib/messageBus";
export {
  uploadFile,
  uploadFiles,
  uploadedToAttachment,
  generateThumbnail,
  downloadAttachment,
  copyAttachmentUrl,
  getAttachmentKind,
  validateFile,
} from "./lib/upload";
export {
  fetchOgMetadata,
  fetchOgMetadataWithCache,
  extractAndFetchPreviews,
  ogCache,
  isValidUrl,
  sanitizeUrl,
} from "./lib/ogPreview";

// Utils
export {
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
} from "./util/formatMessage";
export {
  getUserRole,
  getRolePermissions,
  hasPermission,
  canSend,
  canEdit,
  canDelete,
  canPin,
  canManageUsers,
  canRename,
  canChangeAvatar,
  canManageUser,
  validateMessageLength,
  validateAttachmentSize,
  isFeatureEnabled,
} from "./util/guard";
export {
  generateId,
  generateMessageId,
  generateRoomId,
  generateAttachmentId,
  generateThreadId,
  parseIdType,
  isValidId,
  createCompositeKey,
  parseCompositeKey,
} from "./util/id";
export {
  saveDraft,
  loadDraft,
  clearDraft,
  savePreferences,
  loadPreferences,
  saveMutedRooms,
  loadMutedRooms,
  isRoomMuted,
  toggleRoomMute,
  saveLastRead,
  loadLastRead,
  saveCollapsedThreads,
  loadCollapsedThreads,
  toggleThreadCollapse,
  clearRoomStorage,
} from "./util/storage";

// Config
export {
  DEFAULT_CHAT_CONFIG,
  DEFAULT_CHAT_LAYOUT,
  CHAT_CONFIG_PRESETS,
  mergeConfig,
  mergeLayout,
} from "./config/defaultChatConfig";
export { CommandRegistry, commandRegistry, BUILT_IN_COMMANDS } from "./config/commandRegistry";

// Constants
export { CHAT_CONSTANTS, MESSAGE_ACTIONS, SYSTEM_COMMANDS, ATTACHMENT_MIME_TYPES, ERROR_MESSAGES } from "./constants/chat";
export {
  DEFAULT_PERMISSIONS,
  ROLE_HIERARCHY,
  ROLE_DISPLAY_NAMES,
  PERMISSION_DISPLAY_NAMES,
  CONTEXT_DEFAULT_ROLES,
  isRoleHigherOrEqual,
} from "./constants/roles";

// Types
export type {
  ChatContextMode,
  MessageEditMode,
  MessageDeletionMode,
  ThemeMode,
  TimestampFormat,
  ChatPermission,
  ChatRole,
  LinkedEntity,
  ChatConfig,
  ChatLayout,
} from "./types/config";
export type {
  UserMeta,
  Attachment,
  AttachmentDraft,
  UploadedRef,
  MessageContent,
  Message,
  MessageDraft,
  Paginated,
  ModerationResult,
} from "./types/message";
export type {
  ChatRoomRef,
  RoomMeta,
  ParticipantAction,
  ChatDataSource,
  PresenceInfo,
  TypingInfo,
} from "./types/chat";
export type {
  ChatEvents,
  CommandDefinition,
  MessageBusEvent,
} from "./types/events";
export type { MemberProfile } from "./types/member";

// ============================================================================
// AI Chat System
// ============================================================================

// NOTE: AI Components have been moved to frontend/shared/communications/components/ai/
// Import AI Elements from the main communications facade instead:
// import { Message, Response, PromptInput, ... } from '@/frontend/shared/communications'

// AI Hooks
export { useAI } from "./hooks/useAI";
export type { UseAIProps } from "./hooks/useAI";
export { useAIStoreBase, createAIStore, aiStoreSelectors } from "./hooks/useAIStore";
export type { AIStore } from "./hooks/useAIStore";

// AI Types
export type {
  AIRole,
  AIMessage as AIMessageType,
  AIMessageMetadata,
  AIMessageDraft,
  AISession,
  AISettings,
  AIBotType,
  AIBotConfig,
  AICapability,
  KnowledgeSourceType,
  AIKnowledgeContext,
  AIStoreState,
  AIStoreActions,
  AIDataSource,
  AIConfig,
  AILayout,
  UseAIOptions,
  UseAIReturn,
  AIEvents,
  AIListViewProps,
  AIDetailViewProps,
} from "./types/ai";
export { DEFAULT_AI_SETTINGS } from "./types/ai";
