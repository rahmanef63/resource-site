/**
 * Reaction bar component
 * @module shared/chat/components/ReactionBar
 */

import React from "react";
import { CHAT_CONSTANTS } from "../constants/chat";
import { formatReactionCount } from "../util/formatMessage";

export type ReactionBarProps = {
  reactions: Record<string, string[]>;
  currentUserId: string;
  onReact: (emoji: string) => void;
};

/**
 * Display and interact with message reactions
 */
export function ReactionBar({
  reactions,
  currentUserId,
  onReact,
}: ReactionBarProps) {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);

  const handleReactionClick = (emoji: string) => {
    onReact(emoji);
  };

  const handleAddReaction = (emoji: string) => {
    onReact(emoji);
    setShowEmojiPicker(false);
  };

  const reactionEntries = Object.entries(reactions).filter(
    ([_, userIds]) => userIds.length > 0
  );

  if (reactionEntries.length === 0 && !showEmojiPicker) {
    return null;
  }

  return (
    <div className="chat-reaction-bar">
      {/* Existing reactions */}
      {reactionEntries.map(([emoji, userIds]) => {
        const hasReacted = userIds.includes(currentUserId);
        return (
          <button
            key={emoji}
            className={`chat-reaction ${hasReacted ? "reacted" : ""}`}
            onClick={() => handleReactionClick(emoji)}
            aria-label={`${emoji} ${userIds.length}`}
          >
            <span className="chat-reaction-emoji">{emoji}</span>
            <span className="chat-reaction-count">
              {formatReactionCount(userIds.length)}
            </span>
          </button>
        );
      })}

      {/* Add reaction button */}
      <button
        className="chat-reaction-add"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        aria-label="Add reaction"
      >
        ➕
      </button>

      {/* Simple emoji picker */}
      {showEmojiPicker && (
        <div className="chat-reaction-picker">
          {CHAT_CONSTANTS.COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className="chat-reaction-picker-emoji"
              onClick={() => handleAddReaction(emoji)}
              aria-label={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
