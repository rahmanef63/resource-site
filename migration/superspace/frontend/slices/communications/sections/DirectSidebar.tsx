/**
 * Direct Message Sidebar
 * 
 * Displays direct message conversations.
 * 
 * @module features/communications/sections
 */

"use client"

import * as React from "react"
import { useThreeColumnLayoutSafe } from "@/frontend/shared/ui/layout/container"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Plus, Search } from "lucide-react"

// Shared layout components
import {
  SecondarySidebar,
  type SecondarySidebarSectionProps,
} from "@/frontend/shared/ui/layout"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Store
import {
  useCommunicationsStore,
  useDirectConversations,
  useSelectedDirectId,
  type DirectConversation,
  type PresenceStatus,
} from "../shared"

interface DirectSidebarProps {
  className?: string
}

export function DirectSidebar({ className }: DirectSidebarProps) {
  const conversations = useDirectConversations()
  const selectedId = useSelectedDirectId()
  const selectDirectConversation = useCommunicationsStore(state => state.selectDirectConversation)
  const layoutContext = useThreeColumnLayoutSafe()
  const isMobile = useIsMobile()
  
  const [search, setSearch] = React.useState("")

  // Wrapped handler for mobile navigation
  const handleSelectConversation = React.useCallback((conversationId: string) => {
    selectDirectConversation(conversationId)
    // On mobile, navigate to center panel after selecting
    if (isMobile) {
      layoutContext?.toggleLeft?.()
    }
  }, [selectDirectConversation, layoutContext, isMobile])
  
  // Filter conversations
  const filteredConversations = React.useMemo(() => {
    if (!search.trim()) return conversations
    
    const query = search.toLowerCase()
    return conversations.filter((conv) => 
      conv.name?.toLowerCase().includes(query) ||
      conv.participants.some(p => p.user?.name?.toLowerCase().includes(query))
    )
  }, [conversations, search])

  // Build sections for SecondarySidebar
  const sections: SecondarySidebarSectionProps[] = React.useMemo(() => {
    if (filteredConversations.length === 0) return []
    
    return [{
      id: "conversations",
      content: (
        <div className="space-y-0.5">
          {filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isSelected={conv.id === selectedId}
              onClick={() => handleSelectConversation(conv.id)}
            />
          ))}
        </div>
      ),
    }]
  }, [filteredConversations, selectedId, handleSelectConversation])

  // Header content
  const headerContent = (
    <div className="space-y-2">
      <div className="flex items-center justify-between w-full">
        <h2 className="font-semibold text-sm">Direct Messages</h2>
        <Button aria-label="Add" variant="ghost" size="icon" className="h-7 w-7">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="pl-8 h-8 text-sm"
        />
      </div>
    </div>
  )

  // Empty state
  const emptyContent = filteredConversations.length === 0 ? (
    <div className="text-center py-8 text-muted-foreground text-sm">
      {search ? "No conversations found" : "No conversations yet"}
    </div>
  ) : undefined

  return (
    <SecondarySidebar
      className={cn("h-full", className)}
      header={headerContent}
      sections={sections.length > 0 ? sections : undefined}
      footer={emptyContent}
      variant="minimal"
    />
  )
}

interface ConversationItemProps {
  conversation: DirectConversation
  isSelected: boolean
  onClick: () => void
}

function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  // For 1-1 DMs, show the other person's info
  // For group DMs, show the group name or participant names
  const isGroupDm = conversation.type === "group"
  const otherParticipant = conversation.participants[0]
  
  const displayName = isGroupDm
    ? conversation.name || conversation.participants.map(p => p.user?.name).filter(Boolean).join(", ")
    : otherParticipant?.user?.name || "Unknown"
    
  const avatar = isGroupDm
    ? conversation.icon
    : otherParticipant?.user?.avatar
    
  const status = otherParticipant?.user?.status || "offline"
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-2 py-2 rounded-md",
        "hover:bg-accent hover:text-accent-foreground",
        "transition-colors text-left",
        isSelected && "bg-accent text-accent-foreground"
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        {isGroupDm ? (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-medium">
              {conversation.participants.length}
            </span>
          </div>
        ) : (
          <>
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatar} />
              <AvatarFallback>
                {displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <StatusDot status={status} />
          </>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-sm truncate",
            conversation.unreadCount && "font-semibold"
          )}>
            {displayName}
          </span>
          {conversation.lastMessageAt && (
            <span className="text-xs text-muted-foreground shrink-0 ml-2">
              {formatTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        
        {conversation.lastMessage && (
          <p className={cn(
            "text-xs truncate",
            conversation.unreadCount 
              ? "text-foreground" 
              : "text-muted-foreground"
          )}>
            {conversation.lastMessage.content}
          </p>
        )}
      </div>
      
      {/* Unread badge */}
      {conversation.unreadCount && conversation.unreadCount > 0 && (
        <span className="shrink-0 bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full">
          {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
        </span>
      )}
    </button>
  )
}

function StatusDot({ status }: { status: PresenceStatus }) {
  const colors: Record<PresenceStatus, string> = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
    invisible: "bg-gray-400",
    offline: "bg-gray-400",
  }
  
  if (status === "offline" || status === "invisible") return null
  
  return (
    <span className={cn(
      "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
      colors[status]
    )} />
  )
}

function formatTime(timestamp: string): string {
  // Simple time formatting - would use date-fns in production
  const date = new Date(timestamp)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
  if (diffDays === 1) {
    return "Yesterday"
  }
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" })
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

export default DirectSidebar
