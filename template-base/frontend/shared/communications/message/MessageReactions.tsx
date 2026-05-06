/**
 * Shared Message Reactions Component
 * Context-aware reactions for Chat and AI messages
 * @module shared/communications/message
 */

"use client";

import React, { useState } from "react";
import { 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw, 
  Copy, 
  Reply, 
  Forward,
  Smile,
  MoreHorizontal,
  Flag,
  Share2,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { MessageContext, BaseMessage } from "./types";

// Quick emoji reactions for chat
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export interface MessageReactionsProps {
  message: BaseMessage;
  context: MessageContext;
  isOwn?: boolean;
  isLast?: boolean;
  className?: string;
  // Chat callbacks
  onReact?: (emoji: string) => void;
  onReply?: () => void;
  onForward?: () => void;
  onCopy?: () => void;
  onSave?: () => void;
  onReport?: () => void;
  // AI callbacks
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  onRegenerate?: () => void;
  onShare?: () => void;
}

export function MessageReactions({
  message,
  context,
  isOwn = false,
  isLast = false,
  className,
  onReact,
  onReply,
  onForward,
  onCopy,
  onSave,
  onReport,
  onThumbsUp,
  onThumbsDown,
  onRegenerate,
  onShare,
}: MessageReactionsProps) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopy?.();
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // AI-specific reactions (thumbs up/down, regenerate)
  if (context === 'ai') {
    const isBot = message.author.isBot || message.author.role === 'assistant';
    
    // Only show reactions for AI responses, not user messages
    if (!isBot) return null;

    return (
      <div className={cn(
        "flex items-center gap-1 mt-1",
        className
      )}>
        {/* Thumbs Up */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onThumbsUp}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Good response</TooltipContent>
        </Tooltip>

        {/* Thumbs Down */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onThumbsDown}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bad response</TooltipContent>
        </Tooltip>

        {/* Copy */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
        </Tooltip>

        {/* Regenerate - only on last AI message */}
        {isLast && onRegenerate && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={onRegenerate}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Regenerate response</TooltipContent>
          </Tooltip>
        )}

        {/* Share */}
        {onShare && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={onShare}
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share</TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }

  // Chat-specific reactions (emoji, reply, forward, etc.)
  return (
    <div className={cn(
      "flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
      isOwn ? "flex-row-reverse" : "flex-row",
      className
    )}>
      {/* Quick Emoji React */}
      <Popover open={showEmojis} onOpenChange={setShowEmojis}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <Smile className="h-3.5 w-3.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-2" 
          side={isOwn ? "left" : "right"}
          align="start"
        >
          <div className="flex gap-1">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact?.(emoji);
                  setShowEmojis(false);
                }}
                className="text-lg hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Reply */}
      {onReply && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onReply}
            >
              <Reply className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reply</TooltipContent>
        </Tooltip>
      )}

      {/* Forward */}
      {onForward && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onForward}
            >
              <Forward className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Forward</TooltipContent>
        </Tooltip>
      )}

      {/* Copy */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleCopy}
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy"}</TooltipContent>
      </Tooltip>

      {/* Save/Bookmark */}
      {onSave && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={onSave}
            >
              <Bookmark className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save</TooltipContent>
        </Tooltip>
      )}

      {/* Report (only for received messages) */}
      {!isOwn && onReport && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={onReport}
            >
              <Flag className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Report</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

// Existing reactions display (for reactions already on a message)
export interface ExistingReactionsProps {
  reactions: Array<{
    emoji: string;
    count: number;
    hasReacted?: boolean;
  }>;
  onReact?: (emoji: string) => void;
  className?: string;
}

export function ExistingReactions({
  reactions,
  onReact,
  className,
}: ExistingReactionsProps) {
  if (!reactions.length) return null;

  return (
    <div className={cn("flex gap-1 flex-wrap", className)}>
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => onReact?.(reaction.emoji)}
          className={cn(
            "text-xs px-1.5 py-0.5 rounded-full border transition-colors",
            reaction.hasReacted 
              ? "bg-primary/10 border-primary text-foreground" 
              : "bg-muted border-transparent hover:border-border"
          )}
        >
          {reaction.emoji} {reaction.count}
        </button>
      ))}
    </div>
  );
}

export default MessageReactions;
