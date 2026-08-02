/**
 * Shared Composer Bar Component
 * Unified message composition bar for Chat, AI, and other modules
 * @module shared/communications/composer
 */

"use client"

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Smile, Paperclip, Mic, Send, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "./EmojiPicker";
import { AttachmentMenu, type AttachmentType } from "./AttachmentMenu";
import { 
  type ComposerContext, 
  type ComposerConfig, 
  type ComposerAttachment,
  type ComposerCallbacks,
  DEFAULT_COMPOSER_LABELS 
} from "./types";

export interface ComposerBarProps extends ComposerConfig, ComposerCallbacks {
  /** Context determines default labels and behavior */
  context?: ComposerContext;
  /** Current message value (controlled) */
  value?: string;
  /** Message change handler (controlled) */
  onChange?: (value: string) => void;
  /** Current attachments */
  attachments?: ComposerAttachment[];
  /** Is currently sending */
  isSending?: boolean;
  /** Allowed attachment types */
  allowedAttachmentTypes?: AttachmentType[];
  /** Class name for container */
  className?: string;
}

export function ComposerBar({
  context = 'chat',
  value,
  onChange,
  placeholder,
  disabled = false,
  disabledReason,
  maxLength,
  allowAttachments = true,
  allowEmoji = true,
  allowVoice = true,
  alwaysShowSend = false,
  autoFocus = false,
  multiline = false,
  customActions,
  knowledgeIndicator,
  attachments = [],
  isSending = false,
  allowedAttachmentTypes,
  className,
  onSend,
  onAttachmentAdd,
  onAttachmentRemove,
  onTypingStart,
  onTypingStop,
  onVoiceRecord,
  onEmojiSelect,
}: ComposerBarProps) {
  // Use internal state if not controlled
  const [internalMessage, setInternalMessage] = useState("");
  const message = value ?? internalMessage;
  const setMessage = onChange ?? setInternalMessage;

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const labels = DEFAULT_COMPOSER_LABELS[context];
  const displayPlaceholder = disabled 
    ? (disabledReason || labels.disabled) 
    : (placeholder || labels.placeholder);

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Handle typing indicators
  const handleTyping = useCallback(() => {
    if (disabled) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Notify typing start
    onTypingStart?.();

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      onTypingStop?.();
    }, 3000);
  }, [disabled, onTypingStart, onTypingStop]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = useCallback(() => {
    if (disabled || isSending) return;
    if (message.trim() || attachments.length > 0) {
      onSend?.(message.trim(), attachments);
      setMessage("");
      inputRef.current?.focus();
      
      // Stop typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTypingStop?.();
    }
  }, [disabled, isSending, message, attachments, onSend, setMessage, onTypingStop]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    setMessage(newValue);
    handleTyping();
  }, [maxLength, setMessage, handleTyping]);

  const handleEmojiClick = useCallback((emoji: string) => {
    if (disabled) return;
    setMessage(message + emoji);
    onEmojiSelect?.(emoji);
    inputRef.current?.focus();
  }, [disabled, message, setMessage, onEmojiSelect]);

  const handleAttachmentSelect = useCallback((type: AttachmentType) => {
    if (disabled) return;
    // Create a placeholder attachment - actual file handling would be implemented
    const attachment: ComposerAttachment = {
      id: `${type}-${Date.now()}`,
      type: type === 'media' ? 'image' : type === 'camera' ? 'image' : 'file',
      name: `New ${type}`,
    };
    onAttachmentAdd?.(attachment);
    setShowAttachmentMenu(false);
  }, [disabled, onAttachmentAdd]);

  const hasContent = message.trim().length > 0 || attachments.length > 0;
  const showSendButton = alwaysShowSend || hasContent;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Knowledge indicator (for AI) */}
      {knowledgeIndicator && (
        <div className="px-4 pt-2">
          {knowledgeIndicator}
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 px-4 overflow-x-auto">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative flex-shrink-0 w-16 h-16 rounded-lg bg-muted overflow-hidden group"
            >
              {attachment.thumbnail ? (
                <Image
                  src={attachment.thumbnail}
                  alt={attachment.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  {attachment.type}
                </div>
              )}
              <button
                onClick={() => onAttachmentRemove?.(attachment.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main composer row */}
      <div className="flex items-center gap-2 p-4 border-t border-border bg-card">
        {/* Custom actions */}
        {customActions}

        {/* Emoji Picker */}
        {allowEmoji && (
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-foreground"
                    disabled={disabled}
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>{labels.emojiTooltip}</TooltipContent>
            </Tooltip>
            <PopoverContent 
              side="top" 
              align="start" 
              className="w-auto p-0 border-0 shadow-none bg-transparent"
            >
              <EmojiPicker 
                onEmojiSelect={handleEmojiClick}
                onClose={() => setShowEmojiPicker(false)}
              />
            </PopoverContent>
          </Popover>
        )}
        
        {/* Attachment Menu */}
        {allowAttachments && (
          <Popover open={showAttachmentMenu} onOpenChange={setShowAttachmentMenu}>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-foreground"
                    disabled={disabled}
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent>{labels.attachmentTooltip}</TooltipContent>
            </Tooltip>
            <PopoverContent 
              side="top" 
              align="start" 
              className="w-auto p-0 border-0 shadow-none bg-transparent"
            >
              <AttachmentMenu 
                onSelect={handleAttachmentSelect}
                onClose={() => setShowAttachmentMenu(false)}
                allowedTypes={allowedAttachmentTypes}
              />
            </PopoverContent>
          </Popover>
        )}
        
        {/* Input */}
        <div className="flex-1 relative">
          {multiline ? (
            <Textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={displayPlaceholder}
              disabled={disabled || isSending}
              rows={1}
              className="min-h-[40px] max-h-32 resize-none bg-card border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          ) : (
            <Input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={displayPlaceholder}
              disabled={disabled || isSending}
              className="bg-card border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
            />
          )}
          
          {/* Character count */}
          {maxLength && message.length > maxLength * 0.8 && (
            <div className={cn(
              "absolute right-2 bottom-1 text-xs",
              message.length >= maxLength ? "text-destructive" : "text-muted-foreground"
            )}>
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Send / Voice button */}
        {showSendButton && hasContent ? (
          <Button
            onClick={handleSend}
            size="icon"
            disabled={disabled || isSending || !hasContent}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        ) : allowVoice ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-foreground" 
                disabled={disabled}
                onClick={onVoiceRecord}
              >
                <Mic className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{labels.voiceTooltip}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
}

export default ComposerBar;
