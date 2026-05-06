/**
 * Chat room and data source types
 * @module shared/chat/types/chat
 */

import type { ChatConfig } from "./config";
import type { Message, MessageDraft, Paginated, UserMeta } from "./message";

/**
 * Chat room reference (opaque identifier)
 */
export type ChatRoomRef = {
  roomId: string;
  provider: "convex";
};

/**
 * Chat room metadata
 */
export type RoomMeta = {
  id: string;
  name: string;
  avatarUrl?: string;
  isGroup: boolean;
  contextMode?: ChatConfig["contextMode"];
  linkedEntities?: ChatConfig["linkedEntities"];
  settings?: ChatConfig;
  roles?: Record<string, "owner" | "admin" | "member" | "guest">;
  participantIds?: string[];
  createdAt?: number;
  updatedAt?: number;
};

/**
 * Participant management action
 */
export type ParticipantAction = "add" | "remove" | "promote" | "demote";

/**
 * Data source abstraction for chat backend
 * Allows plugging in Convex or other providers
 */
export type ChatDataSource = {
  // Fetch operations
  listMessages: (roomId: string, cursor?: string) => Promise<Paginated<Message>>;
  getRoomMeta: (roomId: string) => Promise<RoomMeta>;
  listParticipants: (roomId: string) => Promise<UserMeta[]>;

  // Mutate operations
  sendMessage: (roomId: string, draft: MessageDraft) => Promise<Message>;
  editMessage: (
    roomId: string,
    id: string,
    patch: Partial<Message>
  ) => Promise<Message>;
  deleteMessage: (roomId: string, id: string, hard?: boolean) => Promise<void>;
  pinMessage: (roomId: string, id: string, pinned: boolean) => Promise<void>;
  updateRoom: (roomId: string, patch: Partial<RoomMeta>) => Promise<void>;
  manageParticipant: (
    roomId: string,
    userId: string,
    action: ParticipantAction
  ) => Promise<void>;
};

/**
 * Presence information
 */
export type PresenceInfo = {
  userId: string;
  status: "online" | "away" | "offline";
  isTyping?: boolean;
  lastSeen?: number;
};

/**
 * Typing indicator data
 */
export type TypingInfo = {
  userId: string;
  userName?: string;
  startedAt: number;
};
