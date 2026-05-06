/**
 * Chat thread/message list component
 * @module shared/chat/components/ChatThread
 */

import React from "react";
import type { Message, UserMeta } from "../types/message";
import type { RoomMeta, TypingInfo } from "../types/chat";
import type { ChatConfig } from "../types/config";
import { ChatMessage } from "./ChatMessage";
import { TypingIndicator } from "./TypingIndicator";
import { groupMessagesByDate, shouldGroupMessages } from "../util/formatMessage";

export type ChatThreadProps = {
  messages: Message[];
  currentUser: UserMeta;
  roomMeta: RoomMeta | null;
  config: ChatConfig;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onEdit: (messageId: string, patch: Partial<Message>) => Promise<void>;
  onDelete: (messageId: string, hard?: boolean) => Promise<void>;
  onPin: (messageId: string, pinned: boolean) => Promise<void>;
  onReact: (messageId: string, emoji: string) => Promise<void>;
  onLoadMore?: () => Promise<void>;
  hasMore?: boolean;
  isLoading?: boolean;
  typingUsers?: TypingInfo[];
};

/**
 * Message thread with virtualization support
 */
export function ChatThread({
  messages,
  currentUser,
  roomMeta,
  config,
  scrollRef,
  onEdit,
  onDelete,
  onPin,
  onReact,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  typingUsers = [],
}: ChatThreadProps) {
  const [editingMessageId, setEditingMessageId] = React.useState<string | null>(
    null
  );

  // Group messages by date
  const groupedMessages = groupMessagesByDate(messages);

  const handleLoadMore = () => {
    if (hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <div className="chat-thread" ref={scrollRef}>
      {/* Load more button */}
      {hasMore && (
        <div className="chat-thread-load-more">
          <button onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      {/* Messages grouped by date */}
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="chat-thread-date-group">
          {/* Date separator */}
          <div className="chat-thread-date-separator">
            <span>{date}</span>
          </div>

          {/* Messages */}
          {dateMessages.map((message, index) => {
            const prevMessage = index > 0 ? dateMessages[index - 1] : null;
            const isGrouped = prevMessage
              ? shouldGroupMessages(prevMessage, message)
              : false;

            return (
              <ChatMessage
                key={message.id}
                message={message}
                currentUser={currentUser}
                roomMeta={roomMeta}
                config={config}
                isGrouped={isGrouped}
                isEditing={editingMessageId === message.id}
                onEdit={(patch) => {
                  onEdit(message.id, patch);
                  setEditingMessageId(null);
                }}
                onDelete={(hard) => onDelete(message.id, hard)}
                onPin={(pinned) => onPin(message.id, pinned)}
                onReact={(emoji) => onReact(message.id, emoji)}
                onStartEdit={() => setEditingMessageId(message.id)}
                onCancelEdit={() => setEditingMessageId(null)}
              />
            );
          })}
        </div>
      ))}

      {/* Empty state */}
      {messages.length === 0 && !isLoading && (
        <div className="chat-thread-empty">
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}

      {/* Typing indicator */}
      {config.typingIndicator && typingUsers.length > 0 && (
        <TypingIndicator users={typingUsers} />
      )}
    </div>
  );
}
