/**
 * Shared Message Bubble Types
 * Base types for message display across Chat, AI, and other modules
 * @module shared/communications/message
 */

export type MessageContext = 'chat' | 'ai' | 'support' | 'comments';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageAuthor {
  id: string;
  name?: string;
  avatarUrl?: string;
  isBot?: boolean;
  role?: 'user' | 'assistant' | 'system' | 'admin' | 'moderator';
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'file';
  name: string;
  url: string;
  thumbnailUrl?: string;
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted?: boolean;
}

export interface MessageContent {
  text: string;
  html?: string;
  markdown?: boolean;
  attachments?: MessageAttachment[];
}

/**
 * Canonical message shape shared across chat + AI surfaces.
 *
 * Parameterized by feature-specific metadata — pass a typed meta shape
 * when a feature carries extra per-message state (e.g., content generation
 * declares `BaseMessage<ContentMessageMeta>` with generationType/source).
 *
 * Defaulting `TMeta` to `Record<string, unknown>` keeps all existing
 * call-sites compiling unchanged.
 */
export interface BaseMessage<TMeta = Record<string, unknown>> {
  id: string;
  content: MessageContent;
  author: MessageAuthor;
  timestamp: number;
  status?: MessageStatus;
  isSystem?: boolean;
  isEdited?: boolean;
  editedAt?: number;
  replyTo?: string;
  reactions?: MessageReaction[];
  readBy?: string[];
  metadata?: TMeta;
}

export interface MessageBubbleCallbacks {
  onCopy?: (message: BaseMessage) => void;
  onReply?: (message: BaseMessage) => void;
  onEdit?: (message: BaseMessage) => void;
  onDelete?: (message: BaseMessage) => void;
  onReact?: (message: BaseMessage, emoji: string) => void;
  onRegenerate?: (message: BaseMessage) => void;
  onRetry?: (message: BaseMessage) => void;
}

export interface MessageBubbleConfig {
  /** Show avatar */
  showAvatar?: boolean;
  /** Show timestamp */
  showTimestamp?: boolean;
  /** Show status indicators */
  showStatus?: boolean;
  /** Show reactions */
  showReactions?: boolean;
  /** Show message actions on hover */
  showActions?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Allow markdown rendering */
  allowMarkdown?: boolean;
  /** Group consecutive messages from same author */
  grouped?: boolean;
  /** Is this the last message in conversation */
  isLast?: boolean;
}

export interface MessageBubbleLabels {
  copy?: string;
  reply?: string;
  edit?: string;
  delete?: string;
  regenerate?: string;
  retry?: string;
  copied?: string;
  sending?: string;
  sent?: string;
  delivered?: string;
  read?: string;
  failed?: string;
}

export const DEFAULT_MESSAGE_LABELS: Record<MessageContext, MessageBubbleLabels> = {
  chat: {
    copy: 'Copy',
    reply: 'Reply',
    edit: 'Edit',
    delete: 'Delete',
    regenerate: 'Regenerate',
    retry: 'Retry',
    copied: 'Copied!',
    sending: 'Sending...',
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Read',
    failed: 'Failed to send',
  },
  ai: {
    copy: 'Copy',
    reply: 'Reply',
    edit: 'Edit message',
    delete: 'Delete',
    regenerate: 'Regenerate response',
    retry: 'Try again',
    copied: 'Copied to clipboard',
    sending: 'Thinking...',
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Read',
    failed: 'Failed to generate',
  },
  support: {
    copy: 'Copy',
    reply: 'Reply',
    edit: 'Edit',
    delete: 'Delete',
    regenerate: 'Regenerate',
    retry: 'Retry',
    copied: 'Copied!',
    sending: 'Sending...',
    sent: 'Sent',
    delivered: 'Delivered',
    read: 'Seen by support',
    failed: 'Failed to send',
  },
  comments: {
    copy: 'Copy',
    reply: 'Reply',
    edit: 'Edit comment',
    delete: 'Delete comment',
    regenerate: 'Regenerate',
    retry: 'Retry',
    copied: 'Copied!',
    sending: 'Posting...',
    sent: 'Posted',
    delivered: 'Posted',
    read: 'Read',
    failed: 'Failed to post',
  },
};
