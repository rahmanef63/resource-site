/**
 * Support/Helpdesk Chat Container
 * Ticket-based customer support chat
 */

"use client";

import React from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { ChatContainer, useConvexChatDataSource } from "@/frontend/shared/communications";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { UserMeta, MessageDraft, ModerationResult } from "@/frontend/shared/communications";

export type SupportChatContainerProps = {
  workspaceId: Id<"workspaces"> | null;
  ticketId: string;
  ticketTitle?: string;
  ticketStatus?: "open" | "pending" | "resolved" | "closed";
  customerId?: string;
  onTicketUpdate?: (ticketId: string, update: any) => void;
};

/**
 * Support Ticket Chat
 */
export function SupportChatContainer({
  workspaceId,
  ticketId,
  ticketTitle = "Support Ticket",
  ticketStatus = "open",
  customerId,
  onTicketUpdate,
}: SupportChatContainerProps) {
  const dataSource = useConvexChatDataSource(workspaceId);
  const currentUser = useCurrentUser();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const chatUser: UserMeta = {
    id: currentUser.id,
    name: currentUser.name || "Support Agent",
    avatarUrl: currentUser.image,
    roles: ["support_agent"], // Add role for RBAC
  };

  const roomId = `support_${ticketId}`;

  // Handle support message
  const handleSupportMessage = async (draft: MessageDraft) => {

    // Update ticket status if needed
    if (ticketStatus === "pending") {
      onTicketUpdate?.(ticketId, { status: "open" });
    }

    // TODO: Create ticket activity log
    // TODO: Send email notification to customer
  };

  // Moderate messages
  const handleModeration = async (result: ModerationResult) => {
    if (result.action === "block") {
      console.warn("Support message blocked:", result);
      // TODO: Alert moderator
    }
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Ticket Info Header */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Ticket #{ticketId}</h3>
            <p className="text-xs text-muted-foreground">{ticketTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${ticketStatus === "open"
                  ? "bg-green-100 text-green-800"
                  : ticketStatus === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : ticketStatus === "resolved"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                }`}
            >
              {ticketStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 min-h-0">
        <ChatContainer
          room={{ roomId, provider: "convex" }}
          dataSource={dataSource}
          currentUser={chatUser}
          config={{
            contextMode: "support",
            isGroup: false,
            threading: true,
            canReply: true,
            reactionEnabled: false,
            mentionEnabled: false,
            readReceipts: false,
            typingIndicator: false,
            allowAttachments: true,
            maxAttachmentSizeMB: 10,
            linkPreview: false,
            imagePreview: true,
            fileViewer: true,
            messageEditing: "off", // No editing in support
            messageDeletion: "admin",
            moderationEnabled: true,
            allowExport: true,
            pinMessageEnabled: true,
            customCommands: ["/resolve", "/escalate", "/assign", "/note"],
            linkedEntities: [
              { id: ticketId, type: "ticket" },
              ...(customerId ? [{ id: customerId, type: "customer" }] : []),
            ],
          }}
          layout={{
            sidebar: true, // Show customer info
            headerActions: ["search", "pin", "filter"],
            inputAccessories: ["attachments", "emoji"],
          }}
          events={{
            onSend: handleSupportMessage,
            onModeration: handleModeration,
            onCommand: async (cmd, args) => {

              switch (cmd) {
                case "/resolve":
                  onTicketUpdate?.(ticketId, { status: "resolved" });
                  break;
                case "/escalate":
                  onTicketUpdate?.(ticketId, { priority: "high", escalated: true });
                  break;
                case "/assign":
                  // Assign to agent
                  const agentId = args[0];
                  onTicketUpdate?.(ticketId, { assignedTo: agentId });
                  break;
                case "/note":
                  // Add internal note
                  const note = args.join(" ");
                  break;
              }
            },
          }}
        />
      </div>
    </div>
  );
}
