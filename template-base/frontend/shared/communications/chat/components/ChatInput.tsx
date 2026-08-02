/**
 * Chat input component
 * @module shared/chat/components/ChatInput
 */

import React from "react";
import type { MessageDraft, UserMeta, UploadedRef } from "../types/message";
import type { ChatConfig } from "../types/config";
import { ChatComposer } from "./ChatComposer";
import { AttachmentButton } from "./AttachmentButton";
import { loadDraft, saveDraft, clearDraft } from "../util/storage";
import { CHAT_CONSTANTS } from "../constants/chat";

export type ChatInputProps = {
  roomId: string;
  currentUser: UserMeta;
  config: ChatConfig;
  accessories?: Array<"attachments" | "emoji" | "voice" | "commands">;
  onSend: (draft: MessageDraft) => Promise<void>;
  onTyping?: (isTyping: boolean) => void;
  onUpload?: (files: File[]) => Promise<UploadedRef[]>;
  disabled?: boolean;
};

/**
 * Chat input with composer and accessories
 */
export function ChatInput({
  roomId,
  currentUser,
  config,
  accessories = [],
  onSend,
  onTyping,
  onUpload,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = React.useState("");
  const [attachments, setAttachments] = React.useState<UploadedRef[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load draft on mount
  React.useEffect(() => {
    const draft = loadDraft(roomId);
    if (draft) {
      setText(draft);
    }
  }, [roomId]);

  // Save draft on text change
  React.useEffect(() => {
    if (text) {
      saveDraft(roomId, text);
    } else {
      clearDraft(roomId);
    }
  }, [roomId, text]);

  // Handle typing indicator
  const handleTextChange = (value: string) => {
    setText(value);

    // Debounce typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.length > 0) {
      onTyping?.(true);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping?.(false);
      }, CHAT_CONSTANTS.TYPING_DEBOUNCE_MS);
    } else {
      onTyping?.(false);
    }
  };

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() && attachments.length === 0) return;

    const draft: MessageDraft = {
      text: messageText.trim(),
      attachments: [], // TODO: Convert UploadedRef to AttachmentDraft
    };

    try {
      await onSend(draft);
      setText("");
      setAttachments([]);
      clearDraft(roomId);
      onTyping?.(false);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleFileSelect = async (files: File[]) => {
    if (!onUpload) return;

    setIsUploading(true);
    try {
      const uploaded = await onUpload(files);
      setAttachments((prev) => [...prev, ...uploaded]);
    } catch (error) {
      console.error("Failed to upload files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="chat-input">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="chat-input-attachments">
          {attachments.map((att) => (
            <div key={att.id} className="chat-input-attachment">
              <span>{att.name}</span>
              <button
                onClick={() => handleRemoveAttachment(att.id)}
                aria-label="Remove attachment"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main input */}
      <div className="chat-input-main">
        {/* Accessories (left side) */}
        <div className="chat-input-accessories">
          {accessories.includes("attachments") && config.allowAttachments && (
            <AttachmentButton
              onSelect={handleFileSelect}
              disabled={disabled || isUploading}
              maxSizeMB={config.maxAttachmentSizeMB}
            />
          )}

          {accessories.includes("emoji") && (
            <button
              className="chat-input-accessory"
              aria-label="Add emoji"
              disabled={disabled}
            >
              😊
            </button>
          )}

          {accessories.includes("voice") && config.voiceRecorder && (
            <button
              className="chat-input-accessory"
              aria-label="Record voice message"
              disabled={disabled}
            >
              🎤
            </button>
          )}
        </div>

        {/* Composer */}
        <ChatComposer
          value={text}
          onChange={handleTextChange}
          onSend={handleSend}
          placeholder="Type a message..."
          disabled={disabled || isUploading}
          maxLength={config.maxMessageLength}
        />
      </div>
    </div>
  );
}
