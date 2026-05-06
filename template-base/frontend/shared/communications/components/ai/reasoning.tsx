"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible"
import { BrainIcon, ChevronDownIcon } from "lucide-react"

const AUTO_CLOSE_DELAY = 1000

interface ReasoningProps extends React.ComponentProps<typeof Collapsible> {
  /**
   * Auto-opens when true, auto-closes when false
   */
  isStreaming?: boolean
  /**
   * Controlled open state
   */
  open?: boolean
  /**
   * Initial open state for uncontrolled usage
   */
  defaultOpen?: boolean
  /**
   * Callback when open state changes
   */
  onOpenChange?: (open: boolean) => void
  /**
   * Controlled duration in seconds
   */
  duration?: number
}

/**
 * Reasoning - Collapsible AI reasoning display with auto-streaming behavior
 * 
 * Features:
 * - Automatically opens during reasoning streams
 * - Closes when complete
 * - Tracks thinking duration
 * - Provides smooth animations
 */
function Reasoning({
  isStreaming = false,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  duration: controlledDuration,
  className,
  children,
  ...props
}: ReasoningProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen)
  const [duration, setDuration] = React.useState(controlledDuration ?? 0)
  const startTimeRef = React.useRef<number | null>(null)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  const isOpen = controlledOpen ?? internalOpen
  const setIsOpen = onOpenChange ?? setInternalOpen

  // Auto-open/close based on streaming state
  React.useEffect(() => {
    if (isStreaming) {
      setIsOpen(true)
      startTimeRef.current = Date.now()

      // Update duration every second
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
          if (controlledDuration === undefined) {
            setDuration(elapsed)
          }
        }
      }, 1000)
    } else {
      // Auto-close after delay when streaming stops
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      const closeTimeout = setTimeout(() => {
        if (!controlledOpen) {
          setIsOpen(false)
        }
      }, AUTO_CLOSE_DELAY)

      return () => clearTimeout(closeTimeout)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isStreaming, setIsOpen, controlledOpen, controlledDuration])

  return (
    <Collapsible
      data-slot="reasoning"
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "rounded-lg border border-dashed bg-muted/30",
        className
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === ReasoningTrigger) {
            return React.cloneElement(child as React.ReactElement<any>, {
              isStreaming,
              duration: controlledDuration ?? duration,
            })
          }
        }
        return child
      })}
    </Collapsible>
  )
}

interface ReasoningTriggerProps extends React.ComponentProps<typeof CollapsibleTrigger> {
  /**
   * Custom title for thinking state
   */
  title?: string
  /**
   * Internal - passed by Reasoning
   */
  isStreaming?: boolean
  /**
   * Internal - passed by Reasoning
   */
  duration?: number
}

/**
 * ReasoningTrigger - Clickable trigger showing reasoning status and duration
 */
function ReasoningTrigger({ 
  title = "Reasoning", 
  isStreaming,
  duration = 0,
  className, 
  ...props 
}: ReasoningTriggerProps) {
  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return ""
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <CollapsibleTrigger
      data-slot="reasoning-trigger"
      className={cn(
        "flex w-full items-center justify-between gap-2 p-3 text-sm",
        "hover:bg-muted/50 transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <BrainIcon className={cn(
          "size-4",
          isStreaming && "animate-pulse text-primary"
        )} />
        <span className="font-medium">
          {isStreaming ? `${title}...` : title}
        </span>
        {duration > 0 && !isStreaming && (
          <span className="text-xs text-muted-foreground">
            Thought for {formatDuration(duration)}
          </span>
        )}
      </div>
      <ChevronDownIcon className="size-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
    </CollapsibleTrigger>
  )
}

interface ReasoningContentProps extends React.ComponentProps<typeof CollapsibleContent> {
  children: string | React.ReactNode
}

/**
 * ReasoningContent - Content container for reasoning text with animations
 */
function ReasoningContent({ children, className, ...props }: ReasoningContentProps) {
  return (
    <CollapsibleContent
      data-slot="reasoning-content"
      className={cn("border-t border-dashed", className)}
      {...props}
    >
      <div className="p-3 text-sm text-muted-foreground whitespace-pre-wrap">
        {children}
      </div>
    </CollapsibleContent>
  )
}

export { Reasoning, ReasoningTrigger, ReasoningContent }
export type { ReasoningProps, ReasoningTriggerProps, ReasoningContentProps }
