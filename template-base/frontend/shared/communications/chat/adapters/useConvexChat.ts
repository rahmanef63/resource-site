/**
 * Convex Chat Adapter Hook
 * Real implementation using Convex mutations for chat operations
 * @module shared/communications/chat/adapters/useConvexChat
 */

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { ChatDataSource } from "../types/chat";

/**
 * Hook to create a Convex-based chat data source
 * Uses real Convex queries and mutations
 * 
 * @param workspaceId - The workspace ID for scoping conversations
 * @returns ChatDataSource implementation
 */
export function useConvexChatDataSource(workspaceId: Id<"workspaces"> | null): ChatDataSource {
  // Mutations
  const sendMessageMutation = useMutation(api.features.chat.messages.sendMessage);
  const editMessageMutation = useMutation(api.features.chat.messages.editMessage);
  const deleteMessageMutation = useMutation(api.features.chat.messages.deleteMessage);
  const updateConversationMutation = useMutation(api.features.chat.conversations.updateConversation);
  const addParticipantMutation = useMutation(api.features.chat.conversations.addParticipant);
  const removeParticipantMutation = useMutation(api.features.chat.conversations.removeParticipant);

  return {
    listMessages: async (roomId, cursor) => {
      // Use query client-side, this is a placeholder
      // In real implementation, you'd useQuery hook at component level
      return {
        items: [],
        hasMore: false,
        cursor: undefined,
      };
    },

    getRoomMeta: async (roomId) => {
      return {
        id: roomId,
        name: "Chat Room",
        isGroup: true,
      };
    },

    listParticipants: async (roomId) => {
      return [];
    },

    sendMessage: async (roomId, draft) => {
      const result = await sendMessageMutation({
        conversationId: roomId as Id<"conversations">,
        content: draft.markdown ?? draft.text ?? "",
        metadata: draft.meta,
        replyToId: draft.threadOf as Id<"messages"> | undefined,
      });

      return result as any;
    },

    editMessage: async (roomId, messageId, patch) => {
      const content = typeof patch.content === 'string' 
        ? patch.content 
        : (patch.content?.markdown ?? patch.content?.text ?? "");
      const result = await editMessageMutation({
        messageId: messageId as Id<"messages">,
        content,
      });

      return result as any;
    },

    deleteMessage: async (roomId, messageId, hard) => {
      await deleteMessageMutation({
        messageId: messageId as Id<"messages">,
      });
    },

    pinMessage: async (roomId, messageId, pinned) => {
      await updateConversationMutation({
        conversationId: roomId as Id<"conversations">,
        metadata: { isPinned: pinned },
      });
    },

    updateRoom: async (roomId, patch) => {
      await updateConversationMutation({
        conversationId: roomId as Id<"conversations">,
        name: patch.name,
      });
    },

    manageParticipant: async (roomId, userId, action) => {
      switch (action) {
        case "add":
          await addParticipantMutation({
            conversationId: roomId as Id<"conversations">,
            userId: userId as Id<"users">,
          });
          break;
        case "remove":
          await removeParticipantMutation({
            conversationId: roomId as Id<"conversations">,
            userId: userId as Id<"users">,
          });
          break;
        default:
          // Promotions/demotions not yet implemented.
          return;
      }
    },
  };
}

/**
 * Hook to get messages for a room
 */
export function useChatMessages(roomId: string | undefined) {
  const messages = useQuery(
    api.features.chat.messages.getConversationMessages,
    roomId
      ? { conversationId: roomId as Id<"conversations">, limit: 50 }
      : "skip"
  );

  return messages || [];
}

/**
 * Hook to get room metadata
 */
export function useChatRoom(roomId: string | undefined) {
  const room = useQuery(
    api.features.chat.conversations.getConversation,
    roomId ? { conversationId: roomId as Id<"conversations"> } : "skip"
  );

  return room;
}

/**
 * Hook to get participants
 */
export function useChatParticipants(roomId: string | undefined) {
  const conversation = useQuery(
    api.features.chat.conversations.getConversation,
    roomId ? { conversationId: roomId as Id<"conversations"> } : "skip"
  );

  return (conversation?.participants as any) || [];
}
