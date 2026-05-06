/**
 * Individual chat message component
 * @module shared/chat/components/ChatMessage
 */

import React from "react";
import Image from "next/image";
import type { Message, UserMeta } from "../types/message";
import type { RoomMeta } from "../types/chat";
import type { ChatConfig } from "../types/config";
import { useMessageActions } from "../hooks/useMessageActions";
import { formatTimestamp, formatUserName, isDeleted } from "../util/formatMessage";
import { ReactionBar } from "./ReactionBar";
import { ChatComposer } from "./ChatComposer";

export type ChatMessageProps = {
  message: Message;
  currentUser: UserMeta;
  roomMeta: RoomMeta | null;
  config: ChatConfig;
  isGrouped?: boolean;
  isEditing?: boolean;
  onEdit: (patch: Partial<Message>) => void;
  onDelete: (hard?: boolean) => void;
  onPin: (pinned: boolean) => void;
  onReact: (emoji: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
};

/**
 * Individual message component
 */
export function ChatMessage({
  message,
  currentUser,
  roomMeta,
  config,
  isGrouped = false,
  isEditing = false,
  onEdit,
  onDelete,
  onPin,
  onReact,
  onStartEdit,
  onCancelEdit,
}: ChatMessageProps) {
  const [showActions, setShowActions] = React.useState(false);

  const actions = useMessageActions({
    currentUser,
    roomMeta,
    config,
    onEdit: onStartEdit,
    onDelete: () => onDelete(false),
    onPin: (_messageId: string, pinned: boolean) => onPin(pinned),
    onReact,
  });

  const isOwnMessage = message.author.id === currentUser.id;
  const deleted = isDeleted(message);

  const handleSaveEdit = (text: string) => {
    onEdit({
      content: {
        ...message.content,
        text,
      },
    });
  };

  return (
    <div
      className={`chat-message ${isOwnMessage ? "own" : "other"} ${isGrouped ? "grouped" : ""
        } ${deleted ? "deleted" : ""}`}
      data-message-id={message.id}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar (hidden when grouped) */}
      {!isGrouped && (
        <div className="chat-message-avatar">
          {message.author.avatarUrl ? (
            <Image
              src={message.author.avatarUrl}
              alt={formatUserName(message.author)}
              width={32}
              height={32}
              className="h-full w-full rounded-full object-cover"
              sizes="32px"
            />
          ) : (
            <div className="chat-message-avatar-placeholder">
              {formatUserName(message.author)[0]}
            </div>
          )}
        </div>
      )}

      <div className="chat-message-content">
        {/* Header (hidden when grouped) */}
        {!isGrouped && (
          <div className="chat-message-header">
            <span className="chat-message-author">
              {formatUserName(message.author)}
            </span>
            <span className="chat-message-time">
              {formatTimestamp(message.createdAt, config.timestampFormat)}
            </span>
            {message.isPinned && (
              <span className="chat-message-pinned" aria-label="Pinned">
                📌
              </span>
            )}
          </div>
        )}

        {/* Body */}
        <div className="chat-message-body">
          {deleted ? (
            <em className="chat-message-deleted-text">Message deleted</em>
          ) : isEditing ? (
            <ChatComposer
              initialValue={message.content.text || ""}
              onSend={handleSaveEdit}
              onCancel={onCancelEdit}
              placeholder="Edit message..."
              submitLabel="Save"
              autoFocus
            />
          ) : (
            <>
              {/* Text */}
              {message.content.text && (
                <div className="chat-message-text">{message.content.text}</div>
              )}

              {/* Attachments */}
              {message.content.attachments &&
                message.content.attachments.length > 0 && (
                  <div className="chat-message-attachments">
                    {message.content.attachments.map((att) => (
                      <div key={att.id} className="chat-message-attachment">
                        {att.kind === "image" && config.imagePreview ? (
                          <Image
                            src={att.url}
                            alt={att.name || "Image"}
                            width={600}
                            height={400}
                            className="max-w-full h-auto"
                            sizes="100vw"
                          />
                        ) : (
                          <a href={att.url} target="_blank" rel="noopener noreferrer">
                            {att.name || "File"}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              {/* Edited indicator */}
              {message.editedAt && (
                <span className="chat-message-edited">(edited)</span>
              )}
            </>
          )}
        </div>

        {/* Reactions */}
        {!deleted && config.reactionEnabled && message.reactions && (
          <ReactionBar
            reactions={message.reactions}
            currentUserId={currentUser.id}
            onReact={onReact}
          />
        )}

        {/* Actions menu */}
        {!deleted && showActions && (
          <div className="chat-message-actions">
            {actions.getAvailableActions(message).map((action) => (
              <button
                key={action}
                className={`chat-message-action chat-message-action-${action}`}
                onClick={() => actions.handleAction(message, action)}
                aria-label={action}
                title={action}
              >
                {getActionIcon(action)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get icon for action
 */
function getActionIcon(action: string): string {
  switch (action) {
    case "edit":
      return "✏️";
    case "delete":
      return "🗑️";
    case "pin":
      return "📌";
    case "unpin":
      return "📍";
    case "reply":
      return "↩️";
    case "react":
      return "😊";
    case "copy":
      return "📋";
    case "quote":
      return "💬";
    default:
      return "•";
  }
}
