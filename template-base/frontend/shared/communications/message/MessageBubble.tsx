/**
 * Shared Message Bubble Component
 * Unified message display for Chat, AI, and other modules
 * @module shared/communications/message
 */

"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { 
  Check, 
  CheckCheck, 
  Copy, 
  Reply, 
  Edit2, 
  Trash2, 
  RotateCcw,
  RefreshCw,
  Loader2,
  AlertCircle,
  User,
  Bot,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { RichTextRenderer } from "@/frontend/shared/ui/components/rich-text";
import type { 
  BaseMessage, 
  MessageContext, 
  MessageBubbleConfig,
  MessageBubbleCallbacks,
  MessageStatus,
} from "./types";
import { DEFAULT_MESSAGE_LABELS } from "./types";

export interface MessageBubbleProps extends MessageBubbleConfig, MessageBubbleCallbacks {
  message: BaseMessage;
  context?: MessageContext;
  /** Current user ID to determine if message is own */
  currentUserId?: string;
  className?: string;
}

export function MessageBubble({
  message,
  context = 'chat',
  currentUserId,
  showAvatar = true,
  showTimestamp = true,
  showStatus = true,
  showReactions = true,
  showActions = true,
  compact = false,
  allowMarkdown = false,
  grouped = false,
  isLast = false,
  className,
  onCopy,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onRegenerate,
  onRetry,
}: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const labels = DEFAULT_MESSAGE_LABELS[context];
  const isOwn = currentUserId ? message.author.id === currentUserId : false;
  const isBot = message.author.isBot || message.author.role === 'assistant';
  const isSystem = message.isSystem;
  const status = message.status || 'sent';

  // Handle copy
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.(message);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [message, onCopy]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get initials
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Render status icon
  const renderStatus = () => {
    if (!showStatus || !isOwn) return null;

    switch (status) {
      case 'sending':
        return <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-primary" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  // Render avatar
  const renderAvatar = () => {
    if (!showAvatar || (grouped && !isLast)) return <div className="w-8" />;

    if (isBot) {
      return (
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-white" />
        </div>
      );
    }

    return (
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.author.avatarUrl} alt={message.author.name} />
        <AvatarFallback className={cn(
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isOwn ? <User className="h-4 w-4" /> : getInitials(message.author.name)}
        </AvatarFallback>
      </Avatar>
    );
  };

  // System message
  if (isSystem) {
    return (
      <div className={cn("flex justify-center my-2", className)}>
        <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
          {message.content.text}
        </div>
      </div>
    );
  }

  // Message actions
  const actions = (
    <div className={cn(
      "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
      isOwn ? "order-first" : "order-last"
    )}>
      {/* Quick actions */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCopy}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? labels.copied : labels.copy}</TooltipContent>
      </Tooltip>

      {onReply && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onReply(message)}
            >
              <Reply className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{labels.reply}</TooltipContent>
        </Tooltip>
      )}

      {/* AI regenerate */}
      {isBot && isLast && onRegenerate && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onRegenerate(message)}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{labels.regenerate}</TooltipContent>
        </Tooltip>
      )}

      {/* Failed retry */}
      {status === 'failed' && onRetry && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={() => onRetry(message)}
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{labels.retry}</TooltipContent>
        </Tooltip>
      )}

      {/* More actions dropdown */}
      {(onEdit || onDelete) && (
        <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={isOwn ? "end" : "start"}>
            {isOwn && onEdit && (
              <DropdownMenuItem onClick={() => onEdit(message)}>
                <Edit2 className="h-3 w-3 mr-2" />
                {labels.edit}
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                {onEdit && <DropdownMenuSeparator />}
                <DropdownMenuItem 
                  onClick={() => onDelete(message)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  {labels.delete}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "flex gap-2 group",
        isOwn ? "flex-row-reverse" : "flex-row",
        compact ? "mb-1" : "mb-4",
        className
      )}
    >
      {/* Avatar */}
      {renderAvatar()}

      {/* Message bubble */}
      <div className={cn(
        "flex flex-col",
        isOwn ? "items-end" : "items-start",
        "max-w-[80%]"
      )}>
        {/* Author name (for non-own messages in group chat) */}
        {!isOwn && !grouped && message.author.name && (
          <span className="text-xs text-muted-foreground mb-1 ml-1">
            {message.author.name}
          </span>
        )}

        <div className={cn(
          "flex items-end gap-1",
          isOwn ? "flex-row-reverse" : "flex-row"
        )}>
          <Card
            className={cn(
              "p-3 shadow-sm",
              isOwn
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted rounded-bl-sm",
              status === 'failed' && "border-destructive"
            )}
          >
            {/* Message content */}
            <RichTextRenderer
              content={message.content.text}
              variant={allowMarkdown ? "markdown" : "plain"}
              className="break-words"
            />

            {/* Attachments */}
            {message.content.attachments && message.content.attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.content.attachments.map((attachment) => (
                  <div key={attachment.id} className="rounded-lg overflow-hidden">
                    {attachment.type === 'image' && (
                      <Image
                        src={attachment.url}
                        alt={attachment.name}
                        width={800}
                        height={600}
                        className="max-w-full h-auto rounded"
                        sizes="100vw"
                      />
                    )}
                    {attachment.type === 'file' && (
                      <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                        <span className="text-xs">{attachment.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Footer: timestamp and status */}
            <div className={cn(
              "flex items-center gap-1 mt-1",
              isOwn ? "justify-start" : "justify-end"
            )}>
              {showTimestamp && (
                <span className={cn(
                  "text-xs",
                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {formatTime(message.timestamp)}
                </span>
              )}
              {message.isEdited && (
                <span className={cn(
                  "text-xs",
                  isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  (edited)
                </span>
              )}
              {renderStatus()}
            </div>
          </Card>

          {/* Actions */}
          {showActions && actions}
        </div>

        {/* Reactions */}
        {showReactions && message.reactions && message.reactions.length > 0 && (
          <div className="flex gap-1 mt-1 ml-1">
            {message.reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                onClick={() => onReact?.(message, reaction.emoji)}
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded-full border",
                  reaction.hasReacted 
                    ? "bg-primary/10 border-primary" 
                    : "bg-muted border-transparent hover:border-border"
                )}
              >
                {reaction.emoji} {reaction.count}
              </button>
            ))}
          </div>
        )}

        {/* Copied indicator */}
        {copied && (
          <span className="text-xs text-muted-foreground mt-1">
            {labels.copied}
          </span>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
