/**
 * Message types for the reusable chat system
 * @module shared/chat/types/message
 */

/**
 * User metadata for message attribution
 */
export type UserMeta = {
  id: string;
  name?: string;
  avatarUrl?: string;
  roles?: string[];
};

/**
 * Attachment/file metadata
 */
export type Attachment = {
  id: string;
  kind: "image" | "video" | "file" | "audio";
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
  meta?: Record<string, any>;
};

/**
 * Attachment draft (before upload)
 */
export type AttachmentDraft = {
  file: File;
  kind?: Attachment["kind"];
  meta?: Record<string, any>;
};

/**
 * Uploaded file reference
 */
export type UploadedRef = {
  id: string;
  url: string;
  name: string;
  size: number;
  mimeType: string;
};

/**
 * Message content (flexible JSON structure)
 */
export type MessageContent = {
  text?: string;
  markdown?: string;
  attachments?: Attachment[];
  links?: string[];
  meta?: Record<string, any>;
};

/**
 * Core message object
 */
export type Message = {
  id: string;
  roomId: string;
  author: UserMeta;
  createdAt: number;
  editedAt?: number;
  deletedAt?: number;
  content: MessageContent;
  threadOf?: string;
  reactions?: Record<string, string[]>; // emoji -> userIds
  readBy?: string[];
  isPinned?: boolean;
  isSystem?: boolean;
};

/**
 * Message draft (before sending)
 */
export type MessageDraft = {
  text?: string;
  markdown?: string;
  attachments?: AttachmentDraft[];
  threadOf?: string;
  meta?: Record<string, any>;
};

/**
 * Paginated result wrapper
 */
export type Paginated<T> = {
  items: T[];
  cursor?: string;
  hasMore: boolean;
};

/**
 * Moderation result
 */
export type ModerationResult = {
  messageId?: string;
  action: "allow" | "flag" | "block";
  reason?: string;
  confidence?: number;
};
