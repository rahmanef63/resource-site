/**
 * Shared Conversation Components
 * Reusable components for Chat, AI, and other conversation-like features
 * 
 * @module shared/communications/conversation
 * 
 * @example
 * // In Chat feature
 * import { 
 *   ConversationContextMenu, 
 *   ConversationListCard,
 *   EditConversationDialog,
 * } from '@/frontend/shared/communications/conversation'
 * 
 * // Map Chat to ConversationItem
 * const item: ConversationItem = {
 *   id: chat.id,
 *   name: chat.name,
 *   isPinned: chat.isPinned,
 *   // ...
 * }
 * 
 * <ConversationListCard
 *   item={item}
 *   context="chat"
 *   onPin={(id, isPinned) => handlePin(id, isPinned)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 */

// Types
export * from './types'

// Components
export { ConversationContextMenu } from './ConversationContextMenu'
export type { ConversationContextMenuProps } from './ConversationContextMenu'

export { 
  EditConversationDialog,
  DeleteConversationDialog,
  LeaveConversationDialog,
  ArchiveConversationDialog,
} from './ConversationDialogs'
export type {
  EditConversationDialogProps,
  DeleteConversationDialogProps,
  LeaveConversationDialogProps,
  ArchiveConversationDialogProps,
} from './ConversationDialogs'

export { ConversationListCard } from './ConversationListCard'
export type { ConversationListCardProps } from './ConversationListCard'
