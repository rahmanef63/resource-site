"use client";

/**
 * Unified Message Bubble Component
 * 
 * Consistent styling for both Chat and AI features:
 * - User messages: Dark pill on the right (like GrokUserMessage)
 * - Received/AI messages: Clean text on the left with action bar
 * - Supports reactions, reply context, attachments
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RefreshCw,
  MessageSquare,
  Headphones,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Check,
  CheckCheck,
  Loader2,
  Reply,
  Forward,
  Smile,
  Pencil,
  Trash2,
  X,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Response } from "@/frontend/shared/communications/components/ai/response";

// Quick emoji reactions
const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

// ============================================================================
// Types
// ============================================================================

export type MessageVariant = "sent" | "received" | "system" | "ai";

export interface ReplyContext {
  id: string;
  text: string;
  senderName?: string;
}

export interface MessageReaction {
  emoji: string;
  count: number;
  hasReacted?: boolean;
}

export interface BubbleAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  thumbnailUrl?: string;
}

export interface UnifiedMessageBubbleProps {
  /** Unique message ID */
  id: string;
  /** Message content */
  content: string;
  /** Timestamp display string */
  timestamp?: string;
  /** Message type/variant */
  variant: MessageVariant;
  /** Delivery status (for sent messages) */
  status?: "sending" | "sent" | "delivered" | "read";
  /** Sender info (for received messages) */
  sender?: {
    name: string;
    avatar?: string;
  };
  /** Whether to render content as markdown (for AI) */
  markdown?: boolean;
  /** Reply context */
  replyContext?: ReplyContext;
  /** Attachments */
  attachments?: BubbleAttachment[];
  /** Reactions */
  reactions?: MessageReaction[];
  /** Selection mode */
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelectionChange?: (selected: boolean) => void;
  /** Workspace color for read indicator */
  workspaceColor?: string;
  /** Callbacks */
  onReact?: (emoji: string) => void;
  onReply?: () => void;
  onForward?: () => void;
  onCopy?: () => void;
  onEdit?: (newText: string) => void;
  onDelete?: () => void;
  onListen?: () => void;
  onThumbsUp?: () => void;
  onThumbsDown?: () => void;
  onRegenerate?: () => void;
  /** AI-specific */
  feedback?: "up" | "down";
  isRegenerating?: boolean;
  responseTime?: number;
  branches?: Array<{ id: string; content: string; timestamp: number }>;
  currentBranchIndex?: number;
  onBranchChange?: (index: number) => void;
  /** Class name */
  className?: string;
}

// ============================================================================
// User/Sent Message (Dark pill on right)
// ============================================================================

function SentMessage({
  id,
  content,
  timestamp,
  status,
  replyContext,
  attachments,
  reactions = [],
  selectionMode,
  isSelected,
  onSelectionChange,
  onReact,
  onReply,
  onForward,
  onCopy,
  onEdit,
  onDelete,
  workspaceColor = "#6366f1",
  className,
}: UnifiedMessageBubbleProps) {
  const [showEmojis, setShowEmojis] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(content);
  const editInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [isEditing]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
    onCopy?.();
  };

  const handleEditSave = () => {
    if (editText.trim() && editText !== content) {
      onEdit?.(editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    } else if (e.key === "Escape") {
      setEditText(content);
      setIsEditing(false);
    }
  };

  return (
    <div className={cn("flex justify-end mb-4 group relative", selectionMode && "pl-10", className)}>
      {/* Selection checkbox */}
      {selectionMode && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange?.(checked === true)}
            className="h-5 w-5"
          />
        </div>
      )}

      <div className="flex flex-col max-w-[80%]">
        {/* Action bar (on hover) */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mb-1 flex-row-reverse justify-start">
          <TooltipProvider delayDuration={300}>
            {/* Emoji React */}
            <Popover open={showEmojis} onOpenChange={setShowEmojis}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                  <Smile className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="left" align="start">
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

            {onReply && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onReply}>
                    <Reply className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply</TooltipContent>
              </Tooltip>
            )}

            {onForward && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onForward}>
                    <Forward className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Forward</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleCopy}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>

            {onEdit && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit</TooltipContent>
              </Tooltip>
            )}

            {onDelete && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => {
                    if (confirm("Delete this message?")) {
                      onDelete();
                    }
                  }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>

        {/* Reply context */}
        {replyContext && (
          <div className="mb-1 px-3 py-1.5 rounded-t-lg border-l-4 text-xs bg-primary/20 border-primary/60 ml-auto">
            {replyContext.senderName && (
              <span className="font-semibold text-foreground/80 block">{replyContext.senderName}</span>
            )}
            <p className="text-muted-foreground truncate max-w-[200px]">{replyContext.text}</p>
          </div>
        )}

        {/* Attachments preview */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 justify-end">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2">
                <div className="bg-primary/20 p-1 rounded">
                  <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <div className="flex flex-col max-w-[120px]">
                  <span className="text-xs text-foreground truncate font-medium">{att.name}</span>
                  <span className="text-[10px] text-muted-foreground">{(att.size / 1024).toFixed(0)}KB</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message bubble */}
        <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-[15px] w-fit ml-auto">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                ref={editInputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm bg-background text-foreground"
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 text-green-500" onClick={handleEditSave}>
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => {
                setEditText(content);
                setIsEditing(false);
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          )}

          {/* Timestamp and status */}
          <div className="flex items-center justify-end gap-1 mt-1 text-xs text-primary-foreground/70">
            {timestamp && <span>{timestamp}</span>}
            <div className="flex items-center" aria-label={status || "sent"}>
              {status === "sending" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : status === "read" ? (
                <CheckCheck className="h-3 w-3" style={{ color: workspaceColor }} />
              ) : status === "delivered" ? (
                <CheckCheck className="h-3 w-3" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </div>
          </div>
        </div>

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 justify-end">
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
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Received/AI Message (Clean text on left with action bar)
// ============================================================================

function ReceivedMessage({
  id,
  content,
  timestamp,
  sender,
  markdown = false,
  replyContext,
  attachments,
  reactions = [],
  selectionMode,
  isSelected,
  onSelectionChange,
  onReact,
  onReply,
  onForward,
  onCopy,
  onListen,
  onThumbsUp,
  onThumbsDown,
  onRegenerate,
  feedback,
  isRegenerating,
  responseTime,
  branches,
  currentBranchIndex = 0,
  onBranchChange,
  className,
}: UnifiedMessageBubbleProps) {
  const [showEmojis, setShowEmojis] = React.useState(false);
  const [activeBranchIndex, setActiveBranchIndex] = React.useState(
    branches ? branches.length - 1 : 0
  );

  React.useEffect(() => {
    if (branches && branches.length > 0) {
      setActiveBranchIndex(branches.length - 1);
    }
  }, [branches?.length]);

  const handleBranchChange = (newIndex: number) => {
    setActiveBranchIndex(newIndex);
    onBranchChange?.(newIndex);
  };

  const hasBranches = branches && branches.length > 1;
  const activeBranch = branches?.[activeBranchIndex];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard");
    onCopy?.();
  };

  return (
    <div className={cn("flex mb-4 group relative", selectionMode && "pl-10", className)}>
      {/* Selection checkbox */}
      {selectionMode && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectionChange?.(checked === true)}
            className="h-5 w-5"
          />
        </div>
      )}

      {/* Avatar */}
      {sender && (
        <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
          <AvatarImage src={sender.avatar} alt={sender.name} />
          <AvatarFallback>{sender.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}

      <div className="flex flex-col max-w-[80%]">
        {/* Sender name */}
        {sender && (
          <p className="text-xs font-semibold text-primary mb-1">{sender.name}</p>
        )}

        {/* Reply context */}
        {replyContext && (
          <div className="mb-1 px-3 py-1.5 rounded-t-lg border-l-4 text-xs bg-muted border-muted-foreground/40">
            {replyContext.senderName && (
              <span className="font-semibold text-foreground/80 block">{replyContext.senderName}</span>
            )}
            <p className="text-muted-foreground truncate max-w-[200px]">{replyContext.text}</p>
          </div>
        )}

        {/* Attachments preview */}
        {attachments && attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((att) => (
              <div key={att.id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <div className="bg-muted-foreground/20 p-1 rounded">
                  <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                    <polyline points="13 2 13 9 20 9" />
                  </svg>
                </div>
                <div className="flex flex-col max-w-[120px]">
                  <span className="text-xs text-foreground truncate font-medium">{att.name}</span>
                  <span className="text-[10px] text-muted-foreground">{(att.size / 1024).toFixed(0)}KB</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Message content */}
        <div className="text-[15px] text-foreground leading-relaxed">
          {markdown ? (
            hasBranches ? (
              <Response>{activeBranch?.content || ""}</Response>
            ) : (
              <Response>{content}</Response>
            )
          ) : (
            <div className="bg-muted text-foreground px-4 py-2.5 rounded-xl">
              <p className="whitespace-pre-wrap break-words">{content}</p>
              {timestamp && (
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <span>{timestamp}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-1 mt-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider delayDuration={300}>
            {/* Regenerate (AI only) */}
            {onRegenerate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                    onClick={onRegenerate}
                    disabled={isRegenerating}
                  >
                    <RefreshCw className={cn("h-4 w-4", isRegenerating && "animate-spin")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Regenerate</TooltipContent>
              </Tooltip>
            )}

            {/* Reply */}
            {onReply && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent hover:text-accent-foreground" onClick={onReply}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reply</TooltipContent>
              </Tooltip>
            )}

            {/* Listen (AI only) */}
            {onListen && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent hover:text-accent-foreground" onClick={onListen}>
                    <Headphones className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Read aloud</TooltipContent>
              </Tooltip>
            )}

            {/* Copy */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent hover:text-accent-foreground" onClick={handleCopy}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>

            {/* Forward */}
            {onForward && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent hover:text-accent-foreground" onClick={onForward}>
                    <Forward className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Forward</TooltipContent>
              </Tooltip>
            )}

            {/* Emoji React */}
            <Popover open={showEmojis} onOpenChange={setShowEmojis}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-accent hover:text-accent-foreground">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" side="right" align="start">
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

            {/* Thumbs up (AI only) */}
            {onThumbsUp && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 hover:bg-accent hover:text-accent-foreground",
                      feedback === "up" && "text-green-500 hover:text-green-400"
                    )}
                    onClick={onThumbsUp}
                  >
                    <ThumbsUp className={cn("h-4 w-4", feedback === "up" && "fill-current")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Good response</TooltipContent>
              </Tooltip>
            )}

            {/* Thumbs down (AI only) */}
            {onThumbsDown && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 hover:bg-accent hover:text-accent-foreground",
                      feedback === "down" && "text-red-500 hover:text-red-400"
                    )}
                    onClick={onThumbsDown}
                  >
                    <ThumbsDown className={cn("h-4 w-4", feedback === "down" && "fill-current")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bad response</TooltipContent>
              </Tooltip>
            )}

            {/* Separator */}
            {(responseTime || hasBranches) && <div className="w-px h-4 bg-border mx-1" />}

            {/* Response time */}
            {responseTime && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2">
                <Clock className="h-3 w-3" />
                <span>{responseTime.toFixed(1)}s</span>
              </div>
            )}

            {/* Branch navigation */}
            {hasBranches && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-accent"
                  disabled={activeBranchIndex === 0}
                  onClick={() => handleBranchChange(activeBranchIndex - 1)}
                >
                  <span className="text-xs">‹</span>
                </Button>
                <span className="text-xs text-muted-foreground">
                  {activeBranchIndex + 1}/{branches.length}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-accent"
                  disabled={activeBranchIndex === branches.length - 1}
                  onClick={() => handleBranchChange(activeBranchIndex + 1)}
                >
                  <span className="text-xs">›</span>
                </Button>
              </div>
            )}
          </TooltipProvider>
        </div>

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
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
        )}
      </div>
    </div>
  );
}

// ============================================================================
// System Message (Centered)
// ============================================================================

function SystemMessage({ content, className }: Pick<UnifiedMessageBubbleProps, "content" | "className">) {
  return (
    <div className={cn("flex justify-center my-2", className)}>
      <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1 rounded-full">
        {content}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function UnifiedMessageBubble(props: UnifiedMessageBubbleProps) {
  const { variant } = props;

  if (variant === "system") {
    return <SystemMessage {...props} />;
  }

  if (variant === "sent") {
    return <SentMessage {...props} />;
  }

  // "received" or "ai"
  return <ReceivedMessage {...props} markdown={variant === "ai"} />;
}

export default UnifiedMessageBubble;
