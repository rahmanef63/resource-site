/**
 * ID generation utilities
 * @module shared/chat/util/id
 */

/**
 * Generate a unique ID (simple implementation)
 * In production, consider using nanoid or uuid
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a message ID
 */
export function generateMessageId(): string {
  return `msg_${generateId()}`;
}

/**
 * Generate a room ID
 */
export function generateRoomId(): string {
  return `room_${generateId()}`;
}

/**
 * Generate an attachment ID
 */
export function generateAttachmentId(): string {
  return `att_${generateId()}`;
}

/**
 * Generate a thread ID
 */
export function generateThreadId(): string {
  return `thread_${generateId()}`;
}

/**
 * Parse entity type from ID prefix
 */
export function parseIdType(id: string): string | null {
  const match = id.match(/^(\w+)_/);
  return match ? match[1] : null;
}

/**
 * Validate ID format
 */
export function isValidId(id: string): boolean {
  return /^[a-z]+_[\w-]+$/.test(id);
}

/**
 * Create a composite key from multiple IDs
 */
export function createCompositeKey(...ids: string[]): string {
  return ids.join(":");
}

/**
 * Parse composite key into IDs
 */
export function parseCompositeKey(key: string): string[] {
  return key.split(":");
}
