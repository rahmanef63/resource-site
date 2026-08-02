/**
 * Notification/System Log Feed
 * Read-only activity feed
 */

"use client";

import React from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ChatContainer, useConvexChatDataSource } from "@/frontend/shared/communications";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserMeta } from "@/frontend/shared/communications";

export type NotificationFeedProps = {
  workspaceId: Id<"workspaces"> | null;
  filterType?: "all" | "mentions" | "tasks" | "documents";
  width?: number;
};

export function NotificationFeed({
  workspaceId,
  filterType = "all",
  width = 350,
}: NotificationFeedProps) {
  const dataSource = useConvexChatDataSource(workspaceId);
  const currentUser = useCurrentUser();

  if (!currentUser) return null;

  const chatUser: UserMeta = {
    id: currentUser.id,
    name: currentUser.name || "User",
    avatarUrl: currentUser.image,
  };

  return (
    <div style={{ width: `${width}px`, height: "100%" }}>
      <ChatContainer
        room={{ roomId: `notifications_${filterType}`, provider: "convex" }}
        dataSource={dataSource}
        currentUser={chatUser}
        config={{
          contextMode: "system",
          isGroup: false,
          threading: false,
          reactionEnabled: false,
          mentionEnabled: false,
          allowAttachments: false,
          messageEditing: "off",
          messageDeletion: "off",
          readReceipts: false,
          typingIndicator: false,
          pinMessageEnabled: false,
        }}
        layout={{
          sidebar: false,
          headerActions: ["filter"],
          inputAccessories: [],
        }}
      />
    </div>
  );
}
