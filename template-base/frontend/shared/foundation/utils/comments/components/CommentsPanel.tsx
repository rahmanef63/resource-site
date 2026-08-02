/**
 * Comments/Threads Panel
 * Side-panel discussion for any entity (page, document, task, etc.)
 */

"use client";

import React from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ChatContainer, useConvexChatDataSource } from "@/frontend/shared/communications";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserMeta } from "@/frontend/shared/communications";

export type CommentsPanelProps = {
  workspaceId: Id<"workspaces"> | null;
  entityId: string;
  entityType: "page" | "document" | "task" | "project" | "file" | string;
  title?: string;
  position?: "right" | "bottom";
  width?: string | number;
  onClose?: () => void;
};

/**
 * Reusable Comments Panel
 * Can be attached to any entity
 */
export function CommentsPanel({
  workspaceId,
  entityId,
  entityType,
  title = "Comments",
  position = "right",
  width = 400,
  onClose,
}: CommentsPanelProps) {
  const dataSource = useConvexChatDataSource(workspaceId);
  const currentUser = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  const chatUser: UserMeta = {
    id: currentUser.id,
    name: currentUser.name || "User",
    avatarUrl: currentUser.image,
  };

  const roomId = `comments_${entityType}_${entityId}`;

  const panelStyle: React.CSSProperties =
    position === "right"
      ? {
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        width: typeof width === "number" ? `${width}px` : width,
        borderLeft: "1px solid var(--border)",
        zIndex: 50,
        backgroundColor: "var(--background)",
      }
      : {
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: typeof width === "number" ? `${width}px` : width,
        borderTop: "1px solid var(--border)",
        zIndex: 50,
        backgroundColor: "var(--background)",
      };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">{title}</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close comments"
          >
            ?
          </button>
        )}
      </div>

      {/* Chat Container */}
      <div className="h-[calc(100%-4rem)]">
        <ChatContainer
          room={{ roomId, provider: "convex" }}
          dataSource={dataSource}
          currentUser={chatUser}
          config={{
            contextMode: "comment",
            isGroup: true,
            threading: true,
            canReply: true,
            reactionEnabled: true,
            mentionEnabled: true,
            readReceipts: false,
            typingIndicator: false,
            allowAttachments: true,
            maxAttachmentSizeMB: 5,
            linkPreview: false,
            imagePreview: true,
            messageEditing: "author",
            messageDeletion: "author",
            pinMessageEnabled: false,
            linkedEntities: [{ id: entityId, type: entityType }],
          }}
          layout={{
            sidebar: false,
            headerActions: [],
            inputAccessories: ["attachments", "emoji"],
          }}
          events={{
            onSend: async (draft) => {
              // TODO: Notify entity owner
            },
            onMention: async (userIds, messageId) => {
              // TODO: Send mention notifications
            },
          }}
        />
      </div>
    </div>
  );
}
