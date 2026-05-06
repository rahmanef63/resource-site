/**
 * Shared Conversation Types
 * Base types that can be used by Chat, AI, and other conversation-like features
 * @module shared/communications/conversation
 */

/**
 * Base conversation item - shared fields between Chat, AI, etc.
 * Extend this for feature-specific types
 */
export interface ConversationItem {
  id: string
  name: string
  description?: string
  avatar?: string
  timestamp?: string
  
  // Status flags
  isPinned?: boolean
  isFavorite?: boolean
  isMuted?: boolean
  isArchived?: boolean
  
  // Metadata
  tags?: string[]
  unreadCount?: number
  messageCount?: number
}

/**
 * Conversation context - what kind of conversation this is
 */
export type ConversationContext = 'chat' | 'ai' | 'support' | 'comments'

/**
 * Action types available for conversations
 */
export type ConversationAction = 
  | 'edit'
  | 'rename'
  | 'pin'
  | 'unpin'
  | 'favorite'
  | 'unfavorite'
  | 'mute'
  | 'unmute'
  | 'archive'
  | 'unarchive'
  | 'leave'
  | 'delete'
  | 'duplicate'
  | 'export'
  | 'share'

/**
 * Configuration for which actions are available
 */
export interface ConversationActionsConfig {
  canEdit?: boolean
  canRename?: boolean
  canPin?: boolean
  canFavorite?: boolean
  canMute?: boolean
  canArchive?: boolean
  canLeave?: boolean
  canDelete?: boolean
  canDuplicate?: boolean
  canExport?: boolean
  canShare?: boolean
  // Custom actions
  customActions?: CustomAction[]
}

export interface CustomAction {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'destructive' | 'warning'
  onClick: (item: ConversationItem) => void
}

/**
 * Callbacks for conversation actions
 */
export interface ConversationCallbacks<T extends ConversationItem = ConversationItem> {
  onEdit?: (item: T) => void
  onRename?: (item: T) => void
  onPin?: (id: string, isPinned: boolean) => void
  onFavorite?: (id: string, isFavorite: boolean) => void
  onMute?: (id: string, isMuted: boolean) => void
  onArchive?: (id: string, isArchived: boolean) => void
  onLeave?: (id: string) => void
  onDelete?: (id: string) => void
  onDuplicate?: (item: T) => void
  onExport?: (item: T) => void
  onShare?: (item: T) => void
}

/**
 * Labels customization for different contexts
 */
export interface ConversationLabels {
  // Item type labels
  itemType?: string // "Chat", "Session", "Conversation"
  itemTypePlural?: string // "Chats", "Sessions", "Conversations"
  
  // Action labels
  editLabel?: string // "Edit Chat", "Rename Session"
  pinLabel?: string
  unpinLabel?: string
  favoriteLabel?: string
  unfavoriteLabel?: string
  muteLabel?: string
  unmuteLabel?: string
  archiveLabel?: string
  unarchiveLabel?: string
  leaveLabel?: string
  deleteLabel?: string
  
  // Dialog labels
  editTitle?: string
  editDescription?: string
  deleteTitle?: string
  deleteDescription?: string
  leaveTitle?: string
  leaveDescription?: string
}

/**
 * Default labels for different contexts
 */
export const DEFAULT_LABELS: Record<ConversationContext, Partial<ConversationLabels>> = {
  chat: {
    itemType: 'Chat',
    itemTypePlural: 'Chats',
    editLabel: 'Edit Chat',
    deleteTitle: 'Delete Chat?',
    deleteDescription: 'This will permanently delete the chat and all messages.',
    leaveTitle: 'Leave Conversation?',
    leaveDescription: "You won't be able to see new messages unless you're added back.",
  },
  ai: {
    itemType: 'Session',
    itemTypePlural: 'Sessions',
    editLabel: 'Rename Session',
    deleteTitle: 'Delete Session?',
    deleteDescription: 'This will permanently delete this AI session and all messages.',
  },
  support: {
    itemType: 'Ticket',
    itemTypePlural: 'Tickets',
    editLabel: 'Edit Ticket',
    deleteTitle: 'Close Ticket?',
    deleteDescription: 'This will close the support ticket.',
  },
  comments: {
    itemType: 'Thread',
    itemTypePlural: 'Threads',
    editLabel: 'Edit Thread',
    deleteTitle: 'Delete Thread?',
    deleteDescription: 'This will delete the comment thread.',
  },
}

/**
 * Get merged labels with defaults
 */
export function getLabels(
  context: ConversationContext,
  custom?: Partial<ConversationLabels>
): ConversationLabels {
  return {
    ...DEFAULT_LABELS[context],
    ...custom,
  } as ConversationLabels
}
