"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon } from "lucide-react"

interface ConversationContextValue {
  scrollToBottom: () => void
  isAtBottom: boolean
}

const ConversationContext = React.createContext<ConversationContextValue | null>(null)

function useConversation() {
  const context = React.useContext(ConversationContext)
  if (!context) {
    throw new Error("useConversation must be used within a Conversation")
  }
  return context
}

type ConversationScrollBehavior = "smooth" | "instant" | "auto"

interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Initial scroll behavior when new content is added
   */
  initial?: ConversationScrollBehavior
  /**
   * Behavior on container resize
   */
  resize?: ConversationScrollBehavior
}

/**
 * Conversation - Auto-scrolling chat container with stick-to-bottom behavior
 * 
 * Features:
 * - Automatic scrolling to bottom when new messages arrive
 * - Smooth scrolling animations with configurable behavior
 * - Scroll-to-bottom button that appears when scrolled up
 * - Maintains scroll position while users read history
 */
function Conversation({
  initial = "smooth",
  resize = "smooth",
  className,
  children,
  ...props
}: ConversationProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = React.useState(true)

  const scrollToBottom = React.useCallback((behavior: ConversationScrollBehavior = initial) => {
    if (containerRef.current) {
      const normalizedBehavior: ScrollBehavior =
        behavior === "instant" ? "auto" : behavior
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: normalizedBehavior,
      })
    }
  }, [initial])

  const handleScroll = React.useCallback(() => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    const threshold = 100
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < threshold)
  }, [])

  // Auto-scroll when content changes and user is at bottom
  const contentRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    if (!contentRef.current) return

    const observer = new MutationObserver(() => {
      if (isAtBottom) {
        scrollToBottom(initial)
      }
    })

    observer.observe(contentRef.current, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => observer.disconnect()
  }, [isAtBottom, scrollToBottom, initial])

  // Handle resize
  React.useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      if (isAtBottom) {
        scrollToBottom(resize)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [isAtBottom, scrollToBottom, resize])

  return (
    <ConversationContext.Provider value={{ scrollToBottom: () => scrollToBottom(), isAtBottom }}>
      <div
        ref={containerRef}
        data-slot="conversation"
        role="log"
        aria-live="polite"
        className={cn(
          "relative flex-1 overflow-y-auto",
          className
        )}
        onScroll={handleScroll}
        {...props}
      >
        <div ref={contentRef} className="h-full">
          {children}
        </div>
      </div>
    </ConversationContext.Provider>
  )
}

interface ConversationContentProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * ConversationContent - Content wrapper with consistent spacing
 */
function ConversationContent({ className, children, ...props }: ConversationContentProps) {
  return (
    <div
      data-slot="conversation-content"
      className={cn("flex flex-col gap-4 p-4", className)}
      {...props}
    >
      {children}
    </div>
  )
}

interface ConversationScrollButtonProps extends React.ComponentProps<typeof Button> {}

/**
 * ConversationScrollButton - Floating button to return to bottom
 */
function ConversationScrollButton({ className, ...props }: ConversationScrollButtonProps) {
  const { scrollToBottom, isAtBottom } = useConversation()

  if (isAtBottom) return null

  return (
    <Button
      data-slot="conversation-scroll-button"
      variant="secondary"
      size="icon"
      className={cn(
        "absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full shadow-lg",
        "animate-in fade-in-0 zoom-in-95",
        className
      )}
      onClick={() => scrollToBottom()}
      aria-label="Scroll to bottom"
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </Button>
  )
}

export { 
  Conversation, 
  ConversationContent, 
  ConversationScrollButton, 
  useConversation 
}
export type { 
  ConversationProps, 
  ConversationContentProps, 
  ConversationScrollButtonProps 
}
