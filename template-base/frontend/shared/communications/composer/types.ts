/**
 * Shared Composer Types
 * Base types for message composition across Chat, AI, and other modules
 * @module shared/communications/composer
 */

export type ComposerContext = 'chat' | 'ai' | 'support' | 'comments';

export interface ComposerAttachment {
  id: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'file';
  name: string;
  size?: number;
  url?: string;
  file?: File;
  thumbnail?: string;
  mimeType?: string;
}

export interface ComposerCallbacks {
  onSend?: (message: string, attachments?: ComposerAttachment[]) => void | Promise<void>;
  onAttachmentAdd?: (attachment: ComposerAttachment) => void;
  onAttachmentRemove?: (attachmentId: string) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
  onVoiceRecord?: () => void;
  onEmojiSelect?: (emoji: string) => void;
}

export interface ComposerConfig {
  /** Placeholder text for the input */
  placeholder?: string;
  /** Whether the composer is disabled */
  disabled?: boolean;
  /** Reason for being disabled (shown as placeholder) */
  disabledReason?: string;
  /** Maximum message length */
  maxLength?: number;
  /** Allow attachments */
  allowAttachments?: boolean;
  /** Allow emoji picker */
  allowEmoji?: boolean;
  /** Allow voice recording */
  allowVoice?: boolean;
  /** Show send button always (not just when message is present) */
  alwaysShowSend?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;
  /** Multiline input (textarea vs input) */
  multiline?: boolean;
  /** Custom actions to render */
  customActions?: React.ReactNode;
  /** Knowledge indicator (for AI) */
  knowledgeIndicator?: React.ReactNode;
}

export interface ComposerLabels {
  send?: string;
  placeholder?: string;
  emojiTooltip?: string;
  attachmentTooltip?: string;
  voiceTooltip?: string;
  disabled?: string;
}

// Default labels for different contexts
export const DEFAULT_COMPOSER_LABELS: Record<ComposerContext, ComposerLabels> = {
  chat: {
    send: 'Send',
    placeholder: 'Type a message',
    emojiTooltip: 'Emoji',
    attachmentTooltip: 'Attach file',
    voiceTooltip: 'Voice message',
    disabled: "You don't have permission to send messages",
  },
  ai: {
    send: 'Send',
    placeholder: 'Ask about your workspace knowledge...',
    emojiTooltip: 'Emoji',
    attachmentTooltip: 'Attach file',
    voiceTooltip: 'Voice input',
    disabled: 'AI is not available',
  },
  support: {
    send: 'Send',
    placeholder: 'Describe your issue...',
    emojiTooltip: 'Emoji',
    attachmentTooltip: 'Attach screenshot',
    voiceTooltip: 'Voice message',
    disabled: 'Support is currently unavailable',
  },
  comments: {
    send: 'Post',
    placeholder: 'Write a comment...',
    emojiTooltip: 'Emoji',
    attachmentTooltip: 'Attach file',
    voiceTooltip: 'Voice note',
    disabled: 'Comments are disabled',
  },
};
