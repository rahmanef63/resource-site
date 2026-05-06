/**
 * Universal Composer Component
 * 
 * A comprehensive message composition component that works for both
 * Chat (Communications) and AI features with:
 * - Slash commands (/) for tools and actions
 * - Mentions (@) for users, channels, features, workspace
 * - File attachments with preview
 * - Emoji picker
 * - Voice recording
 * - Rich text support
 * 
 * @module shared/communications/composer
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Plus,
  Smile,
  Gift,
  Sticker,
  Image,
  AtSign,
  Hash,
  X,
  Paperclip,
  Send,
  Mic,
  Loader2,
  Slash,
  Code,
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Composer sub-components
import { SlashCommands, type SlashCommand, DEFAULT_SLASH_COMMANDS } from "./SlashCommands"
import { Mentions, type MentionItem } from "./Mentions"
import { EmojiPicker } from "./EmojiPicker"
import { AttachmentMenu, type AttachmentType } from "./AttachmentMenu"
import type { ComposerContext, ComposerAttachment } from "./types"

// =============================================================================
// Types
// =============================================================================

export interface UniversalComposerProps {
  /** Context determines behavior and available features */
  context?: ComposerContext
  /** Placeholder text */
  placeholder?: string
  /** Channel/conversation name for display */
  targetName?: string
  /** Is disabled */
  disabled?: boolean
  /** Disabled reason */
  disabledReason?: string
  /** Max character length */
  maxLength?: number
  /** Is currently sending */
  isSending?: boolean

  // Feature toggles
  /** Allow file attachments */
  allowAttachments?: boolean
  /** Allow emoji picker */
  allowEmoji?: boolean
  /** Allow voice recording */
  allowVoice?: boolean
  /** Allow GIF picker */
  allowGif?: boolean
  /** Allow sticker picker */
  allowStickers?: boolean
  /** Enable slash commands */
  enableSlashCommands?: boolean
  /** Enable @ mentions */
  enableMentions?: boolean
  /** Auto focus on mount */
  autoFocus?: boolean
  /** Show send button always */
  alwaysShowSend?: boolean

  // Data for mentions/commands
  /** Available slash commands */
  slashCommands?: SlashCommand[]
  /** Available mention items (users, channels, etc.) */
  mentionItems?: MentionItem[]
  /** Allowed attachment types */
  allowedAttachmentTypes?: AttachmentType[]

  // Reply
  /** Message being replied to */
  replyTo?: {
    id: string
    content: string
    senderName: string
  } | null
  /** Cancel reply callback */
  onCancelReply?: () => void

  // Callbacks
  /** Send message callback */
  onSend?: (content: string, attachments?: ComposerAttachment[]) => void | Promise<void>
  /** Typing indicator callback */
  onTyping?: () => void
  /** Attachment add callback */
  onAttachmentAdd?: (attachment: ComposerAttachment) => void
  /** Attachment remove callback */
  onAttachmentRemove?: (id: string) => void
  /** Slash command execute callback */
  onSlashCommand?: (command: SlashCommand, args?: string) => void
  /** Mention select callback */
  onMention?: (item: MentionItem) => void
  /** Voice record callback */
  onVoiceRecord?: () => void

  /** Custom actions to render before input */
  customActions?: React.ReactNode
  /** Additional class names */
  className?: string
}

// =============================================================================
// Component
// =============================================================================

export function UniversalComposer({
  context = "chat",
  placeholder,
  targetName = "channel",
  disabled = false,
  disabledReason,
  maxLength = 4000,
  isSending = false,

  allowAttachments = true,
  allowEmoji = true,
  allowVoice = true,
  allowGif = true,
  allowStickers = true,
  enableSlashCommands = true,
  enableMentions = true,
  autoFocus = false,
  alwaysShowSend = false,

  slashCommands = DEFAULT_SLASH_COMMANDS,
  mentionItems = [],
  allowedAttachmentTypes,

  replyTo,
  onCancelReply,

  onSend,
  onTyping,
  onAttachmentAdd,
  onAttachmentRemove,
  onSlashCommand,
  onMention,
  onVoiceRecord,

  customActions,
  className,
}: UniversalComposerProps) {
  // State
  const [content, setContent] = React.useState("")
  const [attachments, setAttachments] = React.useState<ComposerAttachment[]>([])
  const [isDragging, setIsDragging] = React.useState(false)

  // Autocomplete state
  const [showSlashCommands, setShowSlashCommands] = React.useState(false)
  const [showMentions, setShowMentions] = React.useState(false)
  const [autocompleteQuery, setAutocompleteQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)

  // Refs
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const slashCommandsRef = React.useRef<SlashCommand[]>([])
  const mentionItemsRef = React.useRef<MentionItem[]>([])

  // Quick emojis
  const quickEmojis = ["😀", "😂", "❤️", "👍", "👎", "🎉", "🔥", "💯", "✨", "🙏", "😊", "🤔"]

  // Default placeholder
  const displayPlaceholder = disabled 
    ? (disabledReason || "You don't have permission to send messages")
    : (placeholder || `Message ${context === "ai" ? "AI" : `#${targetName}`}`)

  // Filter slash commands for keyboard selection
  const filteredSlashCommands = React.useMemo(() => {
    let filtered = slashCommands
    if (context === "chat") {
      filtered = filtered.filter(cmd => !cmd.aiOnly)
    } else if (context === "ai") {
      filtered = filtered.filter(cmd => !cmd.chatOnly)
    }
    if (autocompleteQuery) {
      const lowerQuery = autocompleteQuery.toLowerCase()
      filtered = filtered.filter(cmd => 
        cmd.command.toLowerCase().includes(lowerQuery) ||
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.keywords?.some(k => k.includes(lowerQuery))
      )
    }
    slashCommandsRef.current = filtered
    return filtered
  }, [slashCommands, autocompleteQuery, context])

  // Filter mention items for keyboard selection  
  const filteredMentionItems = React.useMemo(() => {
    let filtered = mentionItems
    if (autocompleteQuery) {
      const lowerQuery = autocompleteQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) ||
        item.displayName.toLowerCase().includes(lowerQuery)
      )
    }
    mentionItemsRef.current = filtered
    return filtered
  }, [mentionItems, autocompleteQuery])

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px"
    }
  }, [content])

  // Auto focus
  React.useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    if (maxLength && newContent.length > maxLength) return

    setContent(newContent)

    // Check for slash commands
    if (enableSlashCommands) {
      const slashMatch = newContent.match(/\/(\w*)$/)
      if (slashMatch) {
        setShowSlashCommands(true)
        setShowMentions(false)
        setAutocompleteQuery(slashMatch[1])
        setSelectedIndex(0)
      } else {
        setShowSlashCommands(false)
      }
    }

    // Check for mentions
    if (enableMentions) {
      const mentionMatch = newContent.match(/@(\w*)$/)
      if (mentionMatch) {
        setShowMentions(true)
        setShowSlashCommands(false)
        setAutocompleteQuery(mentionMatch[1])
        setSelectedIndex(0)
      } else {
        setShowMentions(false)
      }
    }

    // Typing indicator
    handleTyping()
  }

  // Handle typing indicator
  const handleTyping = React.useCallback(() => {
    if (disabled) return

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    onTyping?.()

    typingTimeoutRef.current = setTimeout(() => {
      // Typing stopped
    }, 3000)
  }, [disabled, onTyping])

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  // Handle submit
  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return
    if (disabled || isSending) return

    try {
      await onSend?.(content, attachments)
      setContent("")
      setAttachments([])
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Navigate autocomplete
    if (showSlashCommands || showMentions) {
      const maxIndex = showSlashCommands 
        ? filteredSlashCommands.length - 1 
        : filteredMentionItems.length - 1

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, maxIndex))
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedIndex(prev => Math.max(0, prev - 1))
        return
      }
      if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault()
        // Execute the selection
        if (showSlashCommands && filteredSlashCommands[selectedIndex]) {
          handleSlashCommandSelect(filteredSlashCommands[selectedIndex])
        } else if (showMentions && filteredMentionItems[selectedIndex]) {
          handleMentionSelect(filteredMentionItems[selectedIndex])
        }
        return
      }
      if (e.key === "Escape") {
        setShowSlashCommands(false)
        setShowMentions(false)
        return
      }
    }

    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  // Handle slash command select
  const handleSlashCommandSelect = (command: SlashCommand) => {
    // Replace the /query with the command
    const newContent = content.replace(/\/\w*$/, "")
    setContent(newContent)
    setShowSlashCommands(false)
    onSlashCommand?.(command)
  }

  // Handle mention select
  const handleMentionSelect = (item: MentionItem) => {
    // Replace @query with the mention
    const newContent = content.replace(/@\w*$/, `@${item.name} `)
    setContent(newContent)
    setShowMentions(false)
    onMention?.(item)
  }

  // Handle file select
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newAttachments: ComposerAttachment[] = Array.from(files).map(file => ({
      id: `${file.name}-${Date.now()}`,
      type: file.type.startsWith("image/") ? "image" 
          : file.type.startsWith("video/") ? "video"
          : file.type.startsWith("audio/") ? "audio"
          : "file",
      name: file.name,
      size: file.size,
      file,
      mimeType: file.type,
    }))

    setAttachments(prev => [...prev, ...newAttachments])
    newAttachments.forEach(a => onAttachmentAdd?.(a))
  }

  // Handle remove attachment
  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
    onAttachmentRemove?.(id)
  }

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart
      const end = textareaRef.current.selectionEnd
      const newContent = content.slice(0, start) + emoji + content.slice(end)
      setContent(newContent)
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(start + emoji.length, start + emoji.length)
        }
      }, 0)
    } else {
      setContent(prev => prev + emoji)
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const hasContent = content.trim().length > 0 || attachments.length > 0
  const showSendButton = alwaysShowSend || hasContent

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn("relative", className)}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Drop zone overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-primary/10 border-2 border-dashed border-primary rounded-lg">
            <p className="text-primary font-medium">Drop files here</p>
          </div>
        )}

        {/* Slash Commands Popover */}
        {showSlashCommands && (
          <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
            <SlashCommands
              query={autocompleteQuery}
              commands={slashCommands}
              selectedIndex={selectedIndex}
              onSelect={handleSlashCommandSelect}
              context={context === "ai" ? "ai" : "chat"}
            />
          </div>
        )}

        {/* Mentions Popover */}
        {showMentions && (
          <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
            <Mentions
              query={autocompleteQuery}
              items={mentionItems}
              selectedIndex={selectedIndex}
              onSelect={handleMentionSelect}
              context={context === "ai" ? "ai" : "chat"}
            />
          </div>
        )}

        {/* Reply preview */}
        {replyTo && (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 dark:bg-zinc-800/50 border border-border border-b-0 border-l-2 border-l-primary rounded-t-lg">
            <span className="text-xs text-muted-foreground">Replying to</span>
            <span className="text-xs font-medium text-primary">
              @{replyTo.senderName}
            </span>
            <span className="text-xs text-muted-foreground truncate flex-1">
              {replyTo.content?.slice(0, 50)}...
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              onClick={onCancelReply}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 py-2 border border-border border-b-0 rounded-t-lg bg-muted/50 dark:bg-zinc-800/50">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="relative flex items-center gap-2 px-2 py-1 bg-background rounded border group"
              >
                <Paperclip className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs truncate max-w-[120px]">{attachment.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Main input area */}
        <div className={cn(
          "flex items-end gap-2 px-4 py-3 bg-muted/50 dark:bg-zinc-800/80 border border-border rounded-lg",
          replyTo && "rounded-t-none border-t-0",
          attachments.length > 0 && !replyTo && "rounded-t-none border-t-0"
        )}>
          {/* Custom actions */}
          {customActions}

          {/* Attach button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          {allowAttachments && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach File</TooltipContent>
            </Tooltip>
          )}

          {/* Text input */}
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={displayPlaceholder}
            disabled={disabled || isSending}
            className={cn(
              "flex-1 min-h-[40px] max-h-[200px] resize-none",
              "bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-muted-foreground/60"
            )}
            rows={1}
          />

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* GIF button */}
            {allowGif && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={disabled}
                  >
                    <Gift className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>GIFs</TooltipContent>
              </Tooltip>
            )}

            {/* Sticker button */}
            {allowStickers && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={disabled}
                  >
                    <Sticker className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Stickers</TooltipContent>
              </Tooltip>
            )}

            {/* Emoji picker */}
            {allowEmoji && (
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={disabled}
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Emoji</TooltipContent>
                </Tooltip>
                <PopoverContent className="w-auto p-3" align="end">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Quick Reactions</p>
                    <div className="grid grid-cols-6 gap-1">
                      {quickEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted text-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {/* Voice button or Send button */}
            {showSendButton && hasContent ? (
              <Button
                variant="default"
                size="icon"
                className="h-8 w-8 ml-1"
                onClick={handleSubmit}
                disabled={disabled || isSending}
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
                    className="h-8 w-8"
                    disabled={disabled}
                    onClick={onVoiceRecord}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voice Message</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
        </div>

        {/* Character count */}
        {content.length > maxLength * 0.9 && (
          <div className="absolute bottom-1 right-4 text-xs text-muted-foreground">
            <span className={cn(content.length >= maxLength && "text-destructive font-medium")}>
              {content.length}
            </span>
            /{maxLength}
          </div>
        )}

        {/* Hint text */}
        {enableSlashCommands && !showSlashCommands && !content && (
          <div className="absolute bottom-14 left-4 text-xs text-muted-foreground flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">/</kbd>
              <span>commands</span>
            </span>
            {enableMentions && (
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">@</kbd>
                <span>mention</span>
              </span>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

export default UniversalComposer
