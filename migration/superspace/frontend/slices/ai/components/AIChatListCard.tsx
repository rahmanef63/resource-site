/**
 * AI Chat List Card
 * Uses shared ConversationListCard with AI-specific styling
 * @module features/ai
 */

"use client"

import { Bot } from "lucide-react"
import { 
  ConversationListCard,
  type ConversationItem,
} from "@/frontend/shared/communications/conversation"
import type { AISession } from "../stores"
import { AIContextMenu } from "./AIContextMenu"

export interface AIChatListCardProps {
  session: AISession
  isActive?: boolean
  onClick?: () => void
  // CRUD callbacks
  onRename?: (session: AISession) => void
  onPin?: (sessionId: string, isPinned: boolean) => void
  onFavorite?: (sessionId: string, isFavorite: boolean) => void
  onArchive?: (sessionId: string, isArchived: boolean) => void
  onDelete?: (sessionId: string) => void
  onDuplicate?: (session: AISession) => void
  onExport?: (session: AISession) => void
}

/**
 * AI-specific list card using shared ConversationListCard
 */
export function AIChatListCard({
  session,
  isActive = false,
  onClick,
  onRename,
  onPin,
  onFavorite,
  onArchive,
  onDelete,
  onDuplicate,
  onExport,
}: AIChatListCardProps) {
  // Guard against undefined session
  if (!session) {
    return null
  }

  // Convert AISession to ConversationItem
  const item: ConversationItem = {
    id: session._id,
    name: session.title,
    description: session.topic,
    timestamp: formatTimestamp(session.updatedAt),
    isPinned: session.isPinned,
    isFavorite: session.isFavorite,
    isMuted: session.isMuted,
    isArchived: session.status === 'archived',
    messageCount: session.messages?.length || 0,
    tags: session.tags,
  }

  // Get last message preview
  const lastMessage = session.messages?.length 
    ? session.messages[session.messages.length - 1]?.content 
    : undefined

  // Check if we have context menu actions
  const hasActions = onRename || onPin || onFavorite || onArchive || onDelete || onDuplicate || onExport

  const cardContent = (
    <ConversationListCard
      item={item}
      isActive={isActive}
      onClick={onClick}
      context="ai"
      lastMessage={lastMessage}
      isGlobal={session.isGlobal}
      showContextMenu={false} // We handle context menu separately
      icon={<Bot className="h-5 w-5 text-white" />}
    />
  )

  // Wrap with context menu if we have actions
  if (hasActions) {
    return (
      <AIContextMenu
        session={session}
        onRename={onRename}
        onPin={onPin}
        onFavorite={onFavorite}
        onArchive={onArchive}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onExport={onExport}
      >
        {cardContent}
      </AIContextMenu>
    )
  }

  return cardContent
}

// Helper function
function formatTimestamp(ts: number): string {
  if (!ts) return ''
  try {
    const date = new Date(ts)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  } catch {
    return ''
  }
}

export default AIChatListCard
