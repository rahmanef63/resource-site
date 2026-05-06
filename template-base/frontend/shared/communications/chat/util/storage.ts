/**
 * Local storage utilities for chat
 * @module shared/chat/util/storage
 */

const STORAGE_PREFIX = "superspace_chat_";

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  DRAFT: (roomId: string) => `${STORAGE_PREFIX}draft_${roomId}`,
  PREFERENCES: `${STORAGE_PREFIX}preferences`,
  MUTED_ROOMS: `${STORAGE_PREFIX}muted_rooms`,
  READ_RECEIPTS: (roomId: string) => `${STORAGE_PREFIX}read_${roomId}`,
  COLLAPSED_THREADS: (roomId: string) => `${STORAGE_PREFIX}collapsed_${roomId}`,
} as const;

/**
 * Save message draft
 */
export function saveDraft(roomId: string, draft: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DRAFT(roomId), draft);
  } catch (error) {
    console.error("Failed to save draft:", error);
  }
}

/**
 * Load message draft
 */
export function loadDraft(roomId: string): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.DRAFT(roomId));
  } catch (error) {
    console.error("Failed to load draft:", error);
    return null;
  }
}

/**
 * Clear message draft
 */
export function clearDraft(roomId: string): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFT(roomId));
  } catch (error) {
    console.error("Failed to clear draft:", error);
  }
}

/**
 * Save user preferences
 */
export function savePreferences(preferences: Record<string, any>): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.PREFERENCES,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error("Failed to save preferences:", error);
  }
}

/**
 * Load user preferences
 */
export function loadPreferences(): Record<string, any> | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load preferences:", error);
    return null;
  }
}

/**
 * Save muted rooms
 */
export function saveMutedRooms(roomIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MUTED_ROOMS, JSON.stringify(roomIds));
  } catch (error) {
    console.error("Failed to save muted rooms:", error);
  }
}

/**
 * Load muted rooms
 */
export function loadMutedRooms(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MUTED_ROOMS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load muted rooms:", error);
    return [];
  }
}

/**
 * Check if room is muted
 */
export function isRoomMuted(roomId: string): boolean {
  const mutedRooms = loadMutedRooms();
  return mutedRooms.includes(roomId);
}

/**
 * Toggle room mute status
 */
export function toggleRoomMute(roomId: string): boolean {
  const mutedRooms = loadMutedRooms();
  const index = mutedRooms.indexOf(roomId);

  if (index > -1) {
    mutedRooms.splice(index, 1);
    saveMutedRooms(mutedRooms);
    return false;
  } else {
    mutedRooms.push(roomId);
    saveMutedRooms(mutedRooms);
    return true;
  }
}

/**
 * Save last read message ID
 */
export function saveLastRead(roomId: string, messageId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.READ_RECEIPTS(roomId), messageId);
  } catch (error) {
    console.error("Failed to save last read:", error);
  }
}

/**
 * Load last read message ID
 */
export function loadLastRead(roomId: string): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.READ_RECEIPTS(roomId));
  } catch (error) {
    console.error("Failed to load last read:", error);
    return null;
  }
}

/**
 * Save collapsed thread IDs
 */
export function saveCollapsedThreads(
  roomId: string,
  threadIds: string[]
): void {
  try {
    localStorage.setItem(
      STORAGE_KEYS.COLLAPSED_THREADS(roomId),
      JSON.stringify(threadIds)
    );
  } catch (error) {
    console.error("Failed to save collapsed threads:", error);
  }
}

/**
 * Load collapsed thread IDs
 */
export function loadCollapsedThreads(roomId: string): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COLLAPSED_THREADS(roomId));
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load collapsed threads:", error);
    return [];
  }
}

/**
 * Toggle thread collapse state
 */
export function toggleThreadCollapse(
  roomId: string,
  threadId: string
): boolean {
  const collapsed = loadCollapsedThreads(roomId);
  const index = collapsed.indexOf(threadId);

  if (index > -1) {
    collapsed.splice(index, 1);
    saveCollapsedThreads(roomId, collapsed);
    return false;
  } else {
    collapsed.push(threadId);
    saveCollapsedThreads(roomId, collapsed);
    return true;
  }
}

/**
 * Clear all chat storage for a room
 */
export function clearRoomStorage(roomId: string): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFT(roomId));
    localStorage.removeItem(STORAGE_KEYS.READ_RECEIPTS(roomId));
    localStorage.removeItem(STORAGE_KEYS.COLLAPSED_THREADS(roomId));
  } catch (error) {
    console.error("Failed to clear room storage:", error);
  }
}
