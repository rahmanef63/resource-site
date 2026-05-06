"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpIcon, LoaderIcon, SquareIcon, PaperclipIcon, XIcon, FileIcon, ImageIcon } from "lucide-react"

type ChatStatus = "ready" | "streaming" | "loading" | "error"

// Attachment type for files
interface Attachment {
  id: string
  file: File
  preview?: string
  type: 'image' | 'file'
}

interface PromptInputContextValue {
  onSubmit?: (e: React.FormEvent) => void
  attachments: Attachment[]
  addAttachment: (file: File) => void
  removeAttachment: (id: string) => void
  clearAttachments: () => void
}

const PromptInputContext = React.createContext<PromptInputContextValue>({
  attachments: [],
  addAttachment: () => {},
  removeAttachment: () => {},
  clearAttachments: () => {},
})

// Hook to use attachments in child components
function usePromptInput() {
  return React.useContext(PromptInputContext)
}

interface PromptInputProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent) => void
  /**
   * Callback when attachments change
   */
  onAttachmentsChange?: (attachments: Attachment[]) => void
}

/**
 * PromptInput - Form container for the prompt input system
 */
function PromptInput({ onSubmit, onAttachmentsChange, className, children, ...props }: PromptInputProps) {
  const [attachments, setAttachments] = React.useState<Attachment[]>([])

  const addAttachment = React.useCallback((file: File) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const type: 'image' | 'file' = file.type.startsWith('image/') ? 'image' : 'file'
    
    const attachment: Attachment = { id, file, type }
    
    // Create preview for images
    if (type === 'image') {
      const reader = new FileReader()
      reader.onload = (e) => {
        setAttachments(prev => {
          const updated = prev.map(a => a.id === id ? { ...a, preview: e.target?.result as string } : a)
          onAttachmentsChange?.(updated)
          return updated
        })
      }
      reader.readAsDataURL(file)
    }
    
    setAttachments(prev => {
      const updated = [...prev, attachment]
      onAttachmentsChange?.(updated)
      return updated
    })
  }, [onAttachmentsChange])

  const removeAttachment = React.useCallback((id: string) => {
    setAttachments(prev => {
      const updated = prev.filter(a => a.id !== id)
      onAttachmentsChange?.(updated)
      return updated
    })
  }, [onAttachmentsChange])

  const clearAttachments = React.useCallback(() => {
    setAttachments([])
    onAttachmentsChange?.([])
  }, [onAttachmentsChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(e)
    // Clear attachments after submit
    clearAttachments()
  }

  return (
    <PromptInputContext.Provider value={{ onSubmit, attachments, addAttachment, removeAttachment, clearAttachments }}>
      <form
        data-slot="prompt-input"
        onSubmit={handleSubmit}
        className={cn(
          "flex flex-col gap-2 rounded-lg border bg-background p-2 shadow-sm",
          className
        )}
        {...props}
      >
        {children}
      </form>
    </PromptInputContext.Provider>
  )
}

interface PromptInputTextareaProps extends React.ComponentProps<typeof Textarea> {
  /**
   * Minimum height in pixels
   */
  minHeight?: number
  /**
   * Maximum height in pixels
   */
  maxHeight?: number
}

/**
 * PromptInputTextarea - Auto-resizing textarea with keyboard shortcuts
 * 
 * - Enter to submit
 * - Shift+Enter for new line
 */
function PromptInputTextarea({
  placeholder = "What would you like to know?",
  minHeight = 48,
  maxHeight = 164,
  className,
  onKeyDown,
  ...props
}: PromptInputTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const { onSubmit } = React.useContext(PromptInputContext)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      const form = textareaRef.current?.closest("form")
      if (form) {
        form.requestSubmit()
      }
    }
    onKeyDown?.(e)
  }

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const resize = () => {
      textarea.style.height = "auto"
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
    }

    textarea.addEventListener("input", resize)
    resize()

    return () => textarea.removeEventListener("input", resize)
  }, [minHeight, maxHeight])

  return (
    <Textarea
      ref={textareaRef}
      data-slot="prompt-input-textarea"
      placeholder={placeholder}
      className={cn(
        "min-h-[48px] resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0",
        className
      )}
      onKeyDown={handleKeyDown}
      style={{ minHeight, maxHeight }}
      {...props}
    />
  )
}

interface PromptInputToolbarProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * PromptInputToolbar - Container for toolbar actions and submit button
 */
function PromptInputToolbar({ className, children, ...props }: PromptInputToolbarProps) {
  return (
    <div
      data-slot="prompt-input-toolbar"
      className={cn("flex items-center justify-between gap-2", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface PromptInputToolsProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * PromptInputTools - Container for tool buttons and controls
 */
function PromptInputTools({ className, children, ...props }: PromptInputToolsProps) {
  return (
    <div
      data-slot="prompt-input-tools"
      className={cn("flex items-center gap-1", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface PromptInputButtonProps extends React.ComponentProps<typeof Button> {}

/**
 * PromptInputButton - Toolbar button with automatic sizing
 */
function PromptInputButton({ variant = "ghost", size = "sm", className, ...props }: PromptInputButtonProps) {
  return (
    <Button
      data-slot="prompt-input-button"
      type="button"
      variant={variant}
      size={size}
      className={cn("gap-1.5", className)}
      {...props}
    />
  )
}

interface PromptInputSubmitProps extends React.ComponentProps<typeof Button> {
  /**
   * Current chat status for icon display
   */
  status?: ChatStatus
}

/**
 * PromptInputSubmit - Submit button with status indicators
 */
function PromptInputSubmit({
  status,
  variant = "default",
  size = "icon",
  className,
  disabled,
  ...props
}: PromptInputSubmitProps) {
  const isLoading = status === "loading" || status === "streaming"

  return (
    <Button
      data-slot="prompt-input-submit"
      type="submit"
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      className={cn("rounded-full", className)}
      aria-label={isLoading ? "Loading..." : "Send message"}
      {...props}
    >
      {status === "streaming" ? (
        <SquareIcon className="size-4 fill-current" />
      ) : isLoading ? (
        <LoaderIcon className="size-4 animate-spin" />
      ) : (
        <ArrowUpIcon className="size-4" />
      )}
    </Button>
  )
}

// Model Select Components
interface PromptInputModelSelectProps extends React.ComponentProps<typeof Select> {}

function PromptInputModelSelect({ ...props }: PromptInputModelSelectProps) {
  return <Select data-slot="prompt-input-model-select" {...props} />
}

interface PromptInputModelSelectTriggerProps extends React.ComponentProps<typeof SelectTrigger> {}

function PromptInputModelSelectTrigger({ className, ...props }: PromptInputModelSelectTriggerProps) {
  return (
    <SelectTrigger
      data-slot="prompt-input-model-select-trigger"
      className={cn("h-8 w-auto gap-1 border-0 bg-transparent shadow-none", className)}
      {...props}
    />
  )
}

interface PromptInputModelSelectContentProps extends React.ComponentProps<typeof SelectContent> {}

function PromptInputModelSelectContent({ ...props }: PromptInputModelSelectContentProps) {
  return <SelectContent data-slot="prompt-input-model-select-content" {...props} />
}

interface PromptInputModelSelectItemProps extends React.ComponentProps<typeof SelectItem> {}

function PromptInputModelSelectItem({ ...props }: PromptInputModelSelectItemProps) {
  return <SelectItem data-slot="prompt-input-model-select-item" {...props} />
}

interface PromptInputModelSelectValueProps extends React.ComponentProps<typeof SelectValue> {}

function PromptInputModelSelectValue({ ...props }: PromptInputModelSelectValueProps) {
  return <SelectValue data-slot="prompt-input-model-select-value" {...props} />
}

// ============================================================================
// Attachment Components
// ============================================================================

interface PromptInputAttachButtonProps extends Omit<React.ComponentProps<typeof Button>, 'onClick'> {
  /**
   * Accepted file types (default: images and common files)
   */
  accept?: string
  /**
   * Allow multiple file selection
   */
  multiple?: boolean
}

/**
 * PromptInputAttachButton - Button to trigger file selection
 */
function PromptInputAttachButton({
  accept = "image/*,.pdf,.doc,.docx,.txt,.md",
  multiple = true,
  variant = "ghost",
  size = "icon",
  className,
  ...props
}: PromptInputAttachButtonProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const { addAttachment } = usePromptInput()

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(addAttachment)
    }
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
        aria-hidden="true"
      />
      <Button
        data-slot="prompt-input-attach-button"
        type="button"
        variant={variant}
        size={size}
        onClick={handleClick}
        className={cn("rounded-full", className)}
        aria-label="Attach file"
        {...props}
      >
        <PaperclipIcon className="size-4" />
      </Button>
    </>
  )
}

interface PromptInputAttachmentsProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * PromptInputAttachments - Display attached files with remove option
 */
function PromptInputAttachments({ className, ...props }: PromptInputAttachmentsProps) {
  const { attachments, removeAttachment } = usePromptInput()

  if (attachments.length === 0) return null

  return (
    <div
      data-slot="prompt-input-attachments"
      className={cn("flex flex-wrap gap-2 p-2 border-t", className)}
      {...props}
    >
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="relative group flex items-center gap-2 bg-muted rounded-md p-2 pr-8 text-sm"
        >
          {attachment.type === 'image' && attachment.preview ? (
            <Image
              src={attachment.preview}
              alt={attachment.file.name}
              width={32}
              height={32}
              className="h-8 w-8 object-cover rounded"
            />
          ) : attachment.type === 'image' ? (
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          ) : (
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="truncate max-w-[120px]">{attachment.file.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeAttachment(attachment.id)}
          >
            <XIcon className="h-3 w-3" />
          </Button>
        </div>
      ))}
    </div>
  )
}

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputAttachButton,
  PromptInputAttachments,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
  usePromptInput,
}
export type {
  PromptInputProps,
  PromptInputTextareaProps,
  PromptInputToolbarProps,
  PromptInputToolsProps,
  PromptInputButtonProps,
  PromptInputSubmitProps,
  PromptInputAttachButtonProps,
  PromptInputAttachmentsProps,
  PromptInputModelSelectProps,
  ChatStatus,
  Attachment,
}
