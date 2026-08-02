"use client"

/**
 * Recent Chats Panel
 * 
 * Displays a list of recent chat sessions for quick access.
 * Supports filtering by feature and shows last message preview.
 */

import { useMemo } from "react"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Plus, Clock, Sparkles, FileText, CheckSquare, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { RecentChatsPanelProps, RecentChatItem } from "./types"

// ============================================================================
// Feature Icons
// ============================================================================

const FEATURE_ICONS: Record<string, typeof MessageSquare> = {
  ai: Sparkles,
  documents: FileText,
  tasks: CheckSquare,
  crm: Users,
  default: MessageSquare,
}

function getFeatureIcon(featureId?: string) {
  return FEATURE_ICONS[featureId || "default"] || FEATURE_ICONS.default
}

// ============================================================================
// Chat Item Component
// ============================================================================

interface ChatItemProps {
  chat: RecentChatItem
  isSelected: boolean
  onClick: () => void
}

function ChatItem({ chat, isSelected, onClick }: ChatItemProps) {
  const FeatureIcon = getFeatureIcon(chat.featureId)
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
        "hover:bg-accent/50",
        isSelected && "bg-accent"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
        "bg-primary/10 text-primary"
      )}>
        {chat.icon ? (
          <span className="text-base">{chat.icon}</span>
        ) : (
          <FeatureIcon className="h-4 w-4" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-medium truncate">{chat.title || "New Chat"}</h4>
          {chat.messageCount && chat.messageCount > 0 && (
            <Badge variant="secondary" className="text-[10px] px-1.5">
              {chat.messageCount}
            </Badge>
          )}
        </div>
        
        {chat.lastMessage && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {chat.lastMessage}
          </p>
        )}
        
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
          <Clock className="h-3 w-3" />
          <span>{formatDistanceToNow(chat.timestamp, { addSuffix: true })}</span>
        </div>
      </div>
    </button>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function RecentChatsPanel({
  featureId,
  sessions,
  selectedSessionId,
  onSessionSelect,
  onNewChat,
  isLoading,
  className,
}: RecentChatsPanelProps) {
  // Sort sessions by timestamp (most recent first)
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => b.timestamp - a.timestamp)
  }, [sessions])

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const groups: { label: string; items: RecentChatItem[] }[] = [
      { label: "Today", items: [] },
      { label: "Yesterday", items: [] },
      { label: "Last 7 Days", items: [] },
      { label: "Older", items: [] },
    ]

    sortedSessions.forEach((session) => {
      const date = new Date(session.timestamp)
      if (date >= today) {
        groups[0].items.push(session)
      } else if (date >= yesterday) {
        groups[1].items.push(session)
      } else if (date >= lastWeek) {
        groups[2].items.push(session)
      } else {
        groups[3].items.push(session)
      }
    })

    return groups.filter((g) => g.items.length > 0)
  }, [sortedSessions])

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-semibold">Recent Chats</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNewChat}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
                  <div className="w-8 h-8 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedSessions.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No recent chats</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={onNewChat}
              >
                <Plus className="h-4 w-4 mr-2" />
                Start a chat
              </Button>
            </div>
          ) : (
            // Grouped chat list
            groupedSessions.map((group) => (
              <div key={group.label}>
                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  {group.label}
                </h4>
                <div className="space-y-1">
                  {group.items.map((chat) => (
                    <ChatItem
                      key={chat._id}
                      chat={chat}
                      isSelected={chat._id === selectedSessionId}
                      onClick={() => onSessionSelect(chat._id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
