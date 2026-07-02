/**
 * Project Discussion Chat
 * Task-focused communication for projects
 */

"use client";

import React from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ChatContainer, useConvexChatDataSource } from "@/frontend/shared/communications";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserMeta } from "@/frontend/shared/communications";

export type ProjectDiscussionChatProps = {
  workspaceId: Id<"workspaces"> | null;
  projectId: string;
  projectName?: string;
};

export function ProjectDiscussionChat({
  workspaceId,
  projectId,
  projectName = "Project",
}: ProjectDiscussionChatProps) {
  const dataSource = useConvexChatDataSource(workspaceId);
  const currentUser = useCurrentUser();

  if (!currentUser) return null;

  const chatUser: UserMeta = {
    id: currentUser.id,
    name: currentUser.name || "User",
    avatarUrl: currentUser.image,
  };

  return (
    <ChatContainer
      room={{ roomId: `project_${projectId}`, provider: "convex" }}
      dataSource={dataSource}
      currentUser={chatUser}
      config={{
        contextMode: "project",
        isGroup: true,
        threading: true,
        mentionEnabled: true,
        allowAttachments: true,
        linkPreview: true,
        pinMessageEnabled: true,
        messageEditing: "author",
        messageDeletion: "admin",
        customCommands: ["/assign", "/milestone", "/status", "/task"],
        linkedEntities: [{ id: projectId, type: "project" }],
      }}
      layout={{
        sidebar: true,
        headerActions: ["search", "pin"],
        inputAccessories: ["attachments", "emoji", "commands"],
      }}
      events={{
        onCommand: async (cmd, args) => {
          switch (cmd) {
            case "/assign":
              break;
            case "/milestone":
              break;
            case "/status":
              break;
            case "/task":
              break;
          }
        },
      }}
    />
  );
}
