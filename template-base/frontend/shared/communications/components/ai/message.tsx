"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

type MessageRole = "user" | "assistant" | "system"

interface MessageContextValue {
  from: MessageRole
}

const MessageContext = React.createContext<MessageContextValue | null>(null)

function useMessage() {
  const context = React.useContext(MessageContext)
  if (!context) {
    throw new Error("useMessage must be used within a Message")
  }
  return context
}

interface MessageProps extends React.HTMLAttributes<HTMLDivElement> {
  from: MessageRole
}

/**
 * Message - Container component for a single message with role-based styling
 * 
 * Role-based layout:
 * - user: aligned right
 * - assistant: aligned left
 * - system: centered
 */
function Message({ from, className, children, ...props }: MessageProps) {
  return (
    <MessageContext.Provider value={{ from }}>
      <div
        data-slot="message"
        data-role={from}
        className={cn(
          "flex w-full gap-3",
          from === "user" && "flex-row-reverse",
          from === "assistant" && "flex-row",
          from === "system" && "justify-center",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </MessageContext.Provider>
  )
}

interface MessageContentProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * MessageContent - Content wrapper for message text or custom content
 */
function MessageContent({ className, children, ...props }: MessageContentProps) {
  const { from } = useMessage()

  return (
    <div
      data-slot="message-content"
      className={cn(
        "max-w-[65ch] rounded-lg px-4 py-2 text-sm",
        from === "user" && "bg-primary text-primary-foreground",
        from === "assistant" && "bg-muted text-foreground",
        from === "system" && "bg-muted/50 text-muted-foreground text-center italic",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface MessageAvatarProps extends React.ComponentProps<typeof Avatar> {
  src: string
  name?: string
}

/**
 * MessageAvatar - Avatar display with name-based fallback
 */
function MessageAvatar({ src, name, className, ...props }: MessageAvatarProps) {
  const fallbackInitials = name ? name.slice(0, 2).toUpperCase() : "AI"

  return (
    <Avatar className={cn("size-8 shrink-0", className)} {...props}>
      <AvatarImage src={src} alt={name || "Avatar"} />
      <AvatarFallback>{fallbackInitials}</AvatarFallback>
    </Avatar>
  )
}

export { Message, MessageContent, MessageAvatar, useMessage }
export type { MessageProps, MessageContentProps, MessageAvatarProps, MessageRole }
