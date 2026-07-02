/**
 * Message Item
 * 
 * Individual message display with hover actions, reactions, replies.
 * 
 * @module features/communications/components
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
    Smile,
    Reply,
    MessageSquare as Thread,
    MoreHorizontal,
    Pencil,
    Trash2,
    Pin,
    Copy,
    Link,
    Flag,
    CornerUpRight,
} from "lucide-react"

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { type Message } from "../shared"
import { RichTextRenderer } from "@/frontend/shared/communications/components/RichTextRenderer"

// =============================================================================
// Message Content Component - Renders rich text
// =============================================================================

interface MessageContentProps {
    content: string
    className?: string
}

function MessageContent({ content, className }: MessageContentProps) {
    // Check if content has any markdown-like formatting
    const hasRichFormatting = React.useMemo(() => {
        return /```|^\s*[-*]\s|^\s*\d+\.\s|^\s*>|^\s*#{1,6}\s|\*\*|__|~~|`[^`]+`|@\w+|#\w+|\[.+\]\(.+\)/.test(content)
    }, [content])

    if (!hasRichFormatting) {
        // Plain text - just render with basic whitespace handling
        return (
            <div className={cn("text-sm whitespace-pre-wrap break-words leading-relaxed", className)}>
                {content}
            </div>
        )
    }

    // Rich text - use the renderer
    return (
        <div className={cn("text-sm", className)}>
            <RichTextRenderer content={content} />
        </div>
    )
}

interface MessageItemProps {
    message: Message
    isGrouped?: boolean
    isHighlighted?: boolean
    isEditing?: boolean
    onReply?: (message: Message) => void
    onStartThread?: (message: Message) => void
    onEdit?: (message: Message) => void
    onDelete?: (message: Message) => void
    onPin?: (message: Message) => void
    onReact?: (message: Message, emoji: string) => void
    className?: string
}

export function MessageItem({
    message,
    isGrouped = false,
    isHighlighted = false,
    isEditing = false,
    onReply,
    onStartThread,
    onEdit,
    onDelete,
    onPin,
    onReact,
    className,
}: MessageItemProps) {
    const [showActions, setShowActions] = React.useState(false)

    const senderName = message.sender?.name || "Unknown"
    const senderAvatar = message.sender?.avatar
    const timestamp = formatTimestamp(message.createdAt)
    const fullTimestamp = formatFullTimestamp(message.createdAt)

    // Common emojis for quick reactions
    const quickEmojis = ["👍", "❤️", "😂", "😮", "😢", "🎉"]

    return (
        <div
            className={cn(
                "group relative px-4 py-0.5 hover:bg-muted/30 transition-colors",
                isHighlighted && "bg-yellow-500/10",
                isGrouped ? "pl-[72px]" : "mt-4",
                className
            )}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
        >
            {/* Reply indicator */}
            {message.replyToId && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 pl-[72px]">
                    <CornerUpRight className="h-3 w-3" />
                    <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-[8px]">R</AvatarFallback>
                    </Avatar>
                    <span className="hover:underline cursor-pointer">@{message.replyTo?.sender?.name || "User"}</span>
                    <span className="truncate opacity-70">{message.replyTo?.content?.slice(0, 50)}...</span>
                </div>
            )}

            {/* Message content */}
            <div className="flex gap-4">
                {/* Avatar (only shown for non-grouped messages) */}
                {!isGrouped && (
                    <Avatar className="h-10 w-10 shrink-0 mt-0.5 cursor-pointer hover:opacity-80">
                        <AvatarImage src={senderAvatar} alt={senderName} />
                        <AvatarFallback className="text-sm font-medium">
                            {senderName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Header (only for non-grouped) */}
                    {!isGrouped && (
                        <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-medium text-sm hover:underline cursor-pointer">
                                {senderName}
                            </span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span className="text-xs text-muted-foreground cursor-default">
                                        {timestamp}
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    <p className="text-xs">{fullTimestamp}</p>
                                </TooltipContent>
                            </Tooltip>
                            {message.isEdited && (
                                <span className="text-xs text-muted-foreground">(edited)</span>
                            )}
                        </div>
                    )}

                    {/* Message text with rich text rendering */}
                    <MessageContent content={message.content} />

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {message.attachments.map((attachment) => (
                                <AttachmentPreview key={attachment.id} attachment={attachment} />
                            ))}
                        </div>
                    )}

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {message.reactions.map((reaction, i) => (
                                <button
                                    key={i}
                                    onClick={() => onReact?.(message, reaction.emoji)}
                                    className={cn(
                                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors",
                                        reaction.hasReacted
                                            ? "bg-primary/10 border-primary/30 text-primary"
                                            : "bg-muted/50 border-transparent hover:bg-muted hover:border-border"
                                    )}
                                >
                                    <span>{reaction.emoji}</span>
                                    <span className="font-medium">{reaction.count}</span>
                                </button>
                            ))}

                            {/* Add reaction button */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button aria-label="Add reaction" className="inline-flex items-center justify-center w-7 h-6 rounded-full border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground hover:bg-muted transition-colors">
                                        <Smile className="h-3 w-3" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2" align="start">
                                    <div className="flex gap-1">
                                        {quickEmojis.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => onReact?.(message, emoji)}
                                                className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted text-lg"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    )}

                    {/* Thread indicator */}
                    {message.threadCount && message.threadCount > 0 && (
                        <button
                            onClick={() => onStartThread?.(message)}
                            className="mt-2 flex items-center gap-2 text-xs text-primary hover:underline"
                        >
                            <Thread className="h-3 w-3" />
                            <span>{message.threadCount} {message.threadCount === 1 ? "reply" : "replies"}</span>
                            {message.threadLastReplyAt && (
                                <span className="text-muted-foreground">
                                    Last reply {formatTimestamp(message.threadLastReplyAt)}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Hover actions bar */}
            {showActions && !isEditing && (
                <TooltipProvider delayDuration={0}>
                    <div className="absolute -top-4 right-4 flex items-center bg-background border rounded-md shadow-lg overflow-hidden">
                        {/* Quick emoji reactions */}
                        <Popover>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <PopoverTrigger asChild>
                                        <Button aria-label="Add reaction" variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                                            <Smile className="h-4 w-4" />
                                        </Button>
                                    </PopoverTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Add Reaction</TooltipContent>
                            </Tooltip>
                            <PopoverContent className="w-auto p-2" align="end">
                                <div className="flex gap-1">
                                    {quickEmojis.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => onReact?.(message, emoji)}
                                            className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted text-lg"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Reply */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button aria-label="Reply"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-none"
                                    onClick={() => onReply?.(message)}
                                >
                                    <Reply className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reply</TooltipContent>
                        </Tooltip>

                        {/* Thread */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button aria-label="Thread"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-none"
                                    onClick={() => onStartThread?.(message)}
                                >
                                    <Thread className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Create Thread</TooltipContent>
                        </Tooltip>

                        {/* More options */}
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button aria-label="More options" variant="ghost" size="icon" className="h-8 w-8 rounded-none">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>More</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit?.(message)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit Message
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onPin?.(message)}>
                                    <Pin className="h-4 w-4 mr-2" />
                                    {message.isPinned ? "Unpin Message" : "Pin Message"}
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy Text
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link className="h-4 w-4 mr-2" />
                                    Copy Message Link
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Flag className="h-4 w-4 mr-2" />
                                    Report Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => onDelete?.(message)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Message
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </TooltipProvider>
            )}
        </div>
    )
}

interface AttachmentPreviewProps {
    attachment: {
        id: string
        name: string
        type?: string
        url?: string
        size?: number
    }
}

function AttachmentPreview({ attachment }: AttachmentPreviewProps) {
    const isImage = attachment.type?.startsWith("image/")

    if (isImage && attachment.url) {
        return (
            <div className="relative max-w-md h-[300px] rounded-lg overflow-hidden border bg-muted">
                <Image
                    src={attachment.url}
                    alt={attachment.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 448px"
                />
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/50 max-w-xs">
            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                {attachment.name.split(".").pop()?.toUpperCase().slice(0, 3)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                {attachment.size && (
                    <p className="text-xs text-muted-foreground">
                        {formatFileSize(attachment.size)}
                    </p>
                )}
            </div>
        </div>
    )
}

function formatTimestamp(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return "Just now"
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`

    const isToday = date.toDateString() === now.toDateString()
    if (isToday) {
        return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        ` at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}

function formatFullTimestamp(dateStr: string): string {
    return new Date(dateStr).toLocaleString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default MessageItem
