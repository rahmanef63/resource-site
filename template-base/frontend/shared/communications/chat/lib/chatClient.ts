/**
 * Chat client - Convex integration adapter
 * @module shared/chat/lib/chatClient
 */

import type {
  ChatDataSource,
  ParticipantAction,
  RoomMeta,
} from "../types/chat";
import type {
  Message,
  MessageDraft,
  Paginated,
  UserMeta,
} from "../types/message";

/**
 * Create Convex-based chat data source
 *
 * @param convex - Convex client instance
 * @param namespace - Convex function namespace (e.g., "chat" or "features/chat")
 * @returns ChatDataSource implementation
 *
 * @example
 * ```tsx
 * const convex = useConvex();
 * const dataSource = createConvexChatDataSource(convex, "chat");
 * ```
 */
export function createConvexChatDataSource(
  convex: any, // TODO: Type as ConvexReactClient
  namespace = "chat"
): ChatDataSource {
  const api = {
    listMessages: `${namespace}:listMessages`,
    getRoomMeta: `${namespace}:getRoomMeta`,
    listParticipants: `${namespace}:listParticipants`,
    sendMessage: `${namespace}:sendMessage`,
    editMessage: `${namespace}:editMessage`,
    deleteMessage: `${namespace}:deleteMessage`,
    pinMessage: `${namespace}:pinMessage`,
    updateRoom: `${namespace}:updateRoom`,
    manageParticipant: `${namespace}:manageParticipant`,
  };

  return {
    async listMessages(roomId: string, cursor?: string): Promise<Paginated<Message>> {
      // TODO: Call convex.query(api.listMessages, { roomId, cursor })
      return {
        items: [],
        cursor: undefined,
        hasMore: false,
      };
    },

    async getRoomMeta(roomId: string): Promise<RoomMeta> {
      // TODO: Call convex.query(api.getRoomMeta, { roomId })
      return {
        id: roomId,
        name: "Loading...",
        isGroup: false,
      };
    },

    async listParticipants(roomId: string): Promise<UserMeta[]> {
      // TODO: Call convex.query(api.listParticipants, { roomId })
      return [];
    },

    async sendMessage(roomId: string, draft: MessageDraft): Promise<Message> {
      // TODO: Call convex.mutation(api.sendMessage, { roomId, ...draft })
      throw new Error("Not implemented");
    },

    async editMessage(
      roomId: string,
      id: string,
      patch: Partial<Message>
    ): Promise<Message> {
      // TODO: Call convex.mutation(api.editMessage, { roomId, messageId: id, patch })
      throw new Error("Not implemented");
    },

    async deleteMessage(
      roomId: string,
      id: string,
      hard = false
    ): Promise<void> {
      // TODO: Call convex.mutation(api.deleteMessage, { roomId, messageId: id, hard })
    },

    async pinMessage(
      roomId: string,
      id: string,
      pinned: boolean
    ): Promise<void> {
      // TODO: Call convex.mutation(api.pinMessage, { roomId, messageId: id, pinned })
    },

    async updateRoom(roomId: string, patch: Partial<RoomMeta>): Promise<void> {
      // TODO: Call convex.mutation(api.updateRoom, { roomId, patch })
    },

    async manageParticipant(
      roomId: string,
      userId: string,
      action: ParticipantAction
    ): Promise<void> {
      // TODO: Call convex.mutation(api.manageParticipant, { roomId, userId, action })
    },
  };
}

/**
 * Create mock data source for testing/development
 */
export function createMockChatDataSource(): ChatDataSource {
  const mockMessages: Message[] = [];
  const mockRooms: Record<string, RoomMeta> = {};
  const mockParticipants: Record<string, UserMeta[]> = {};

  return {
    async listMessages(roomId: string, cursor?: string): Promise<Paginated<Message>> {
      const filtered = mockMessages.filter((m) => m.roomId === roomId);
      return {
        items: filtered.slice(0, 50),
        cursor: undefined,
        hasMore: false,
      };
    },

    async getRoomMeta(roomId: string): Promise<RoomMeta> {
      return (
        mockRooms[roomId] || {
          id: roomId,
          name: `Room ${roomId}`,
          isGroup: false,
        }
      );
    },

    async listParticipants(roomId: string): Promise<UserMeta[]> {
      return mockParticipants[roomId] || [];
    },

    async sendMessage(roomId: string, draft: MessageDraft): Promise<Message> {
      const message: Message = {
        id: `msg_${Date.now()}`,
        roomId,
        author: { id: "user1", name: "Test User" },
        createdAt: Date.now(),
        content: {
          text: draft.text,
          markdown: draft.markdown,
          attachments: [],
        },
      };
      mockMessages.push(message);
      return message;
    },

    async editMessage(
      roomId: string,
      id: string,
      patch: Partial<Message>
    ): Promise<Message> {
      const message = mockMessages.find((m) => m.id === id);
      if (!message) throw new Error("Message not found");
      Object.assign(message, patch);
      message.editedAt = Date.now();
      return message;
    },

    async deleteMessage(roomId: string, id: string, hard = false): Promise<void> {
      const index = mockMessages.findIndex((m) => m.id === id);
      if (index > -1) {
        if (hard) {
          mockMessages.splice(index, 1);
        } else {
          mockMessages[index].deletedAt = Date.now();
        }
      }
    },

    async pinMessage(roomId: string, id: string, pinned: boolean): Promise<void> {
      const message = mockMessages.find((m) => m.id === id);
      if (message) {
        message.isPinned = pinned;
      }
    },

    async updateRoom(roomId: string, patch: Partial<RoomMeta>): Promise<void> {
      if (mockRooms[roomId]) {
        Object.assign(mockRooms[roomId], patch);
      }
    },

    async manageParticipant(
      roomId: string,
      userId: string,
      action: ParticipantAction
    ): Promise<void> {
      // Mock implementation
    },
  };
}
