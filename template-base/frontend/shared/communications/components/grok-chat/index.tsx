"use client"

/**
 * Grok-style AI Chat Components
 * 
 * Minimal, clean design inspired by X/Grok AI:
 * - User messages as simple dark pills on the right
 * - AI messages as clean text on the left with action bar
 * - Follow-up suggestions
 * - Response time indicator
 */

import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  RefreshCw, 
  MessageSquare, 
  Headphones, 
  Share2, 
  Copy,
  ThumbsUp, 
  ThumbsDown,
  MoreHorizontal,
  CornerDownRight,
  Zap,
  Sparkles,
  Clock,
  Image as ImageIcon,
  Camera,
  FileText,
  Mic,
  Video,
  Upload,
  PenTool,
  HardDrive,
  Cloud,
  X,
  Briefcase,
  Layers,
  Search,
  Globe,
  Lock,
  Flag,
  FileDown,
  Link
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { Response } from "../ai/response"
import { Reasoning, ReasoningTrigger, ReasoningContent } from "../ai/reasoning"

// ============================================================================
// Types
// ============================================================================

export interface GrokMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Message role */
  from: "user" | "assistant"
  /** Response time in seconds (for AI messages) */
  responseTime?: number
  /** Speed label (e.g., "Fast") */
  speedLabel?: string
  /** Message branches for regeneration */
  branches?: Array<{ id: string; content: string; timestamp: number }>
  /** Current branch index */
  currentBranchIndex?: number
  /** On branch change */
  onBranchChange?: (index: number) => void
  /** Actions */
  onRegenerate?: () => void
  onReply?: () => void
  onListen?: () => void
  onShare?: () => void
  onThumbsUp?: () => void
  onThumbsDown?: () => void
  onMore?: () => void
  /** Feedback state */
  feedback?: string
  /** Follow-up suggestions */
  suggestions?: string[]
  /** On suggestion click */
  onSuggestionClick?: (suggestion: string) => void
  /** Is regenerating */
  isRegenerating?: boolean
  /** AI reasoning/thinking content */
  reasoning?: string
  /** Is streaming reasoning */
  isStreamingReasoning?: boolean
  /** Children (message content) */
  children?: React.ReactNode
}

// ============================================================================
// User Message (Dark pill on right)
// ============================================================================

export function GrokUserMessage({ 
  children, 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex justify-end mb-6", className)} {...props}>
      <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-xl max-w-[80%] text-[15px]">
        {children}
      </div>
    </div>
  )
}

// ============================================================================
// AI Message (Clean text with action bar)
// ============================================================================

export function GrokAIMessage({
  children,
  responseTime,
  speedLabel = "Fast",
  branches,
  currentBranchIndex = 0,
  onBranchChange,
  onRegenerate,
  onReply,
  onListen,
  onShare,
  onThumbsUp,
  onThumbsDown,
  onMore,
  feedback,
  suggestions,
  onSuggestionClick,
  isRegenerating,
  reasoning,
  isStreamingReasoning,
  className,
  ...props
}: Omit<GrokMessageProps, 'from'>) {
  const [activeBranchIndex, setActiveBranchIndex] = React.useState(
    branches ? branches.length - 1 : 0
  )

  // Auto-update to latest branch
  React.useEffect(() => {
    if (branches && branches.length > 0) {
      setActiveBranchIndex(branches.length - 1)
    }
  }, [branches?.length])

  const handleBranchChange = (newIndex: number) => {
    setActiveBranchIndex(newIndex)
    onBranchChange?.(newIndex)
  }

  const hasBranches = branches && branches.length > 1
  const activeBranch = branches?.[activeBranchIndex]

  return (
    <div className={cn("mb-6", className)} {...props}>
      {/* Reasoning display (if available) */}
      {reasoning && (
        <Reasoning isStreaming={isStreamingReasoning} className="mb-4">
          <ReasoningTrigger>Thinking process</ReasoningTrigger>
          <ReasoningContent>
            <Response className="text-muted-foreground text-sm">{reasoning}</Response>
          </ReasoningContent>
        </Reasoning>
      )}

      {/* Message content */}
      <div className="text-[15px] text-foreground leading-relaxed">
        {hasBranches 
          ? <Response>{activeBranch?.content || ''}</Response>
          : children}
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-1 mt-3 text-muted-foreground">
        <TooltipProvider delayDuration={300}>
          {/* Regenerate */}
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

          {/* Reply */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                onClick={onReply}
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reply</TooltipContent>
          </Tooltip>

          {/* Listen */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                onClick={onListen}
              >
                <Headphones className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Read aloud</TooltipContent>
          </Tooltip>

          {/* Copy (was Share) */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
                onClick={onShare}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy</TooltipContent>
          </Tooltip>

          {/* Thumbs up */}
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

          {/* Thumbs down */}
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

          {/* More Menu */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-1 bg-popover border-border text-popover-foreground" align="start">
              <div className="flex flex-col gap-0.5">
                <Button variant="ghost" className="justify-start h-9 px-2 text-sm font-normal hover:bg-accent hover:text-accent-foreground" onClick={() => onMore?.()}>
                  <Flag className="mr-2 h-4 w-4" />
                  Report Issue
                </Button>
                <Button variant="ghost" className="justify-start h-9 px-2 text-sm font-normal hover:bg-accent hover:text-accent-foreground">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export to PDF
                </Button>
                <Button variant="ghost" className="justify-start h-9 px-2 text-sm font-normal hover:bg-accent hover:text-accent-foreground">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Referenced Conversations
                </Button>
                <Button variant="ghost" className="justify-start h-9 px-2 text-sm font-normal hover:bg-accent hover:text-accent-foreground">
                  <Link className="mr-2 h-4 w-4" />
                  Create share link
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Separator */}
          <div className="w-px h-4 bg-border mx-1" />

          {/* Response time */}
          {responseTime && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-2">
              <Clock className="h-3 w-3" />
              <span>{responseTime.toFixed(1)}s</span>
              <span className="opacity-50">·</span>
              <span>{speedLabel}</span>
            </div>
          )}

          {/* Branch navigation */}
          {hasBranches && (
            <>
              <div className="w-px h-4 bg-border mx-1" />
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
            </>
          )}
        </TooltipProvider>
      </div>

      {/* Follow-up suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className="mt-4 space-y-2">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick?.(suggestion)}
              className="flex items-center gap-2 text-primary hover:text-primary/80 text-[15px] transition-colors"
            >
              <CornerDownRight className="h-4 w-4 text-muted-foreground" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Typing Indicator
// ============================================================================

export function GrokTypingIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkles className="h-4 w-4 animate-pulse" />
        <span className="text-sm">Thinking...</span>
      </div>
    </div>
  )
}

// ============================================================================
// Chat Container
// ============================================================================

export interface GrokChatContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function GrokChatContainer({ 
  children, 
  className, 
  ...props 
}: GrokChatContainerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [children])

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex-1 overflow-y-auto px-4 py-6",
        "bg-background", // Theme-aware background
        className
      )}
      {...props}
    >
      <div className="max-w-3xl mx-auto">
        {children}
      </div>
    </div>
  )
}

// ============================================================================
// Input Area
// ============================================================================

export interface GrokInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  disabled?: boolean
  /** Think harder mode */
  thinkHarder?: boolean
  onThinkHarderChange?: (enabled: boolean) => void
  /** Model selector */
  model?: string
  onModelChange?: (model: string) => void
  /** Attachments */
  onAttach?: (files: FileList) => void
  attachments?: File[]
  onRemoveAttachment?: (index: number) => void
  /** Reply context */
  replyingTo?: string | null
  onCancelReply?: () => void
  className?: string
}

export function GrokInput({
  value,
  onChange,
  onSubmit,
  placeholder = "How can Grok help?",
  disabled,
  thinkHarder,
  onThinkHarderChange,
  model = "Auto",
  onModelChange,
  onAttach,
  attachments = [],
  onRemoveAttachment,
  replyingTo,
  onCancelReply,
  className,
}: GrokInputProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.key === 'Enter' || e.key === 'NumpadEnter') && !e.shiftKey) {
      // Don't submit while IME composition is active
      if (e.nativeEvent.isComposing) return
      e.preventDefault()
      if ((value.trim() || attachments.length > 0) && !disabled) {
        onSubmit()
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAttach?.(e.target.files)
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn("border-t border-border bg-background p-3 md:p-4", className)}>
      <div className="max-w-3xl mx-auto">
        {/* Reply Preview */}
        {replyingTo && (
          <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-lg border-l-4 border-primary mb-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex-1 min-w-0 mr-4">
              <div className="text-xs text-primary font-medium mb-0.5">Replying to AI</div>
              <div className="text-sm text-foreground truncate">{replyingTo}</div>
            </div>
            <button 
              onClick={onCancelReply}
              className="p-1 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Think Harder toggle */}
        {thinkHarder !== undefined && (
          <div className="flex justify-center mb-3">
            <div
              onClick={() => onThinkHarderChange?.(!thinkHarder)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer",
                thinkHarder 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-secondary text-muted-foreground hover:bg-accent"
              )}
            >
              <Zap className="h-4 w-4" />
              <span>Think Harder</span>
              {thinkHarder && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    onThinkHarderChange?.(false)
                  }}
                  className="ml-1 hover:text-foreground"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}

        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 px-1">
            {attachments.map((file, i) => (
              <div key={i} className="relative group">
                <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 pr-8">
                  <div className="bg-muted p-1 rounded">
                    <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                      <polyline points="13 2 13 9 20 9" />
                    </svg>
                  </div>
                  <div className="flex flex-col max-w-[150px]">
                    <span className="text-xs text-foreground truncate font-medium">{file.name}</span>
                    <span className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(0)}KB</span>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveAttachment?.(i)}
                  className="absolute top-1 right-1 p-1 bg-muted rounded-full text-muted-foreground hover:text-foreground hover:bg-accent opacity-0 group-hover:opacity-100 transition-all"
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input field */}
        <div className="relative flex items-center bg-secondary rounded-xl border border-border">
          {/* Attachment button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="p-3 text-muted-foreground hover:text-foreground transition-colors"
                title="Attach files"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-1 bg-popover border-border" align="start" side="top">
              <div className="grid gap-1">
                <button 
                  onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.accept = "*/*"
                      fileInputRef.current.removeAttribute('capture')
                      fileInputRef.current.click()
                    }
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-popover-foreground hover:bg-accent rounded-md transition-colors w-full text-left"
                >
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  Upload a file
                </button>
                
                <button 
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-popover-foreground hover:bg-accent rounded-md transition-colors w-full text-left"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Add text content
                </button>

                <button 
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-popover-foreground hover:bg-accent rounded-md transition-colors w-full text-left"
                >
                  <PenTool className="h-4 w-4 text-muted-foreground" />
                  Draw a sketch
                </button>

                <div className="h-px bg-border my-1" />

                <button 
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-popover-foreground hover:bg-accent rounded-md transition-colors w-full text-left"
                >
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  Connect Workspace
                </button>

                <button 
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-popover-foreground hover:bg-accent rounded-md transition-colors w-full text-left"
                >
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  Connect Features
                </button>

                <div className="h-px bg-border my-1" />

                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <input 
                        type="text" 
                        placeholder="Search past chats..." 
                        className="w-full bg-secondary text-foreground text-xs rounded-md py-1.5 pl-7 pr-2 border-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="flex bg-secondary rounded-md p-0.5">
                      <button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground" title="Public">
                        <Globe className="h-3 w-3" />
                      </button>
                      <button className="p-1 rounded bg-accent text-accent-foreground shadow-sm" title="Private">
                        <Lock className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button className="flex items-center justify-between w-full text-left text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded px-2 py-1.5 transition-colors">
                      <span className="truncate">Project Architecture</span>
                      <span className="text-[10px] opacity-60">2h</span>
                    </button>
                    <button className="flex items-center justify-between w-full text-left text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded px-2 py-1.5 transition-colors">
                      <span className="truncate">Debug Auth Issue</span>
                      <span className="text-[10px] opacity-60">1d</span>
                    </button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Textarea */}
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className={cn(
              "flex-1 bg-transparent text-foreground placeholder-muted-foreground py-3 px-1",
              "resize-none outline-none text-[15px]",
              "max-h-[200px]"
            )}
            style={{ 
              height: 'auto',
              minHeight: '24px'
            }}
          />

          {/* Right side controls */}
          <div className="flex items-center gap-2 pr-3">
            {/* Model selector */}
            <button 
              className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
              onClick={() => onModelChange?.(model === 'Auto' ? 'GPT-4' : 'Auto')}
            >
              <Sparkles className="h-4 w-4" />
              <span>{model}</span>
              <span className="text-xs">▾</span>
            </button>

            {/* Send button */}
            <button
              onClick={onSubmit}
              disabled={disabled || (!value.trim() && attachments.length === 0)}
              className={cn(
                "p-2 rounded-full transition-colors",
                (value.trim() || attachments.length > 0) && !disabled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default {
  GrokUserMessage,
  GrokAIMessage,
  GrokTypingIndicator,
  GrokChatContainer,
  GrokInput,
}
