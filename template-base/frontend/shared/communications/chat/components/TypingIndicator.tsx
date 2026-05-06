/**
 * Typing indicator component
 * @module shared/chat/components/TypingIndicator
 */

import React from "react";
import type { TypingInfo } from "../types/chat";

export type TypingIndicatorProps = {
  users: TypingInfo[];
};

/**
 * Display typing indicator for active users
 */
export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const names = users.map((u) => u.userName || `User ${u.userId}`);

  const text =
    names.length === 1
      ? `${names[0]} is typing...`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing...`
      : `${names.length} people are typing...`;

  return (
    <div className="chat-typing-indicator" aria-live="polite">
      <span className="chat-typing-text">{text}</span>
      <span className="chat-typing-dots">
        <span className="chat-typing-dot"></span>
        <span className="chat-typing-dot"></span>
        <span className="chat-typing-dot"></span>
      </span>
    </div>
  );
}
