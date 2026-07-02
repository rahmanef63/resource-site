/**
 * AI Context Menu
 * Wrapper around shared ConversationContextMenu for AI-specific usage
 * @module features/ai
 */

"use client"

import * as React from "react"
import { 
  ConversationContextMenu, 
  type ConversationItem,
} from "@/frontend/shared/communications/conversation"
import type { AISession } from "../stores"

// Helper function
function formatTimestamp(ts: number): string {
  if (!ts) return ''
  try {
    const date = new Date(ts)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })
  } catch {
    return ''
  }
}

export interface AIContextMenuProps {
  session: AISession
  children: React.ReactNode
  onRename?: (session: AISession) => void
  onPin?: (sessionId: string, isPinned: boolean) => void
  onFavorite?: (sessionId: string, isFavorite: boolean) => void
  onArchive?: (sessionId: string, isArchived: boolean) => void
  onDelete?: (sessionId: string) => void
  onDuplicate?: (session: AISession) => void
  onExport?: (session: AISession) => void
}

/**
 * AI-specific context menu using shared ConversationContextMenu
 */
export function AIContextMenu({
  session,
  children,
  onRename,
  onPin,
  onFavorite,
  onArchive,
  onDelete,
  onDuplicate,
  onExport,
}: AIContextMenuProps) {
  // Guard against undefined session
  if (!session) {
    return <>{children}</>
  }

  // Convert AISession to ConversationItem
  const item: ConversationItem = {
    id: session.id || session._id,
    name: session.title,
    description: session.topic,
    timestamp: formatTimestamp(session.updatedAt),
    isPinned: session.isPinned,
    isFavorite: session.isFavorite,
    isArchived: session.status === 'archived',
    messageCount: session.messages?.length || 0,
  }

  return (
    <ConversationContextMenu
      item={item}
      context="ai"
      showLeave={false}
      isGroup={false}
      onRename={onRename ? () => onRename(session) : undefined}
      onPin={onPin}
      onFavorite={onFavorite}
      onArchive={onArchive}
      onDelete={onDelete}
      onDuplicate={onDuplicate ? () => onDuplicate(session) : undefined}
      onExport={onExport ? () => onExport(session) : undefined}
    >
      {children}
    </ConversationContextMenu>
  )
}

export default AIContextMenu
