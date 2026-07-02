/**
 * AI Dialogs
 * Wrapper around shared ConversationDialogs for AI-specific usage
 * @module features/ai
 */

"use client"

import * as React from "react"
import {
  EditConversationDialog,
  DeleteConversationDialog,
  ArchiveConversationDialog,
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

// ============================================================================
// Helper: Convert AISession to ConversationItem
// ============================================================================

function sessionToConversationItem(session: AISession | null | undefined): ConversationItem | null {
  if (!session) return null
  return {
    id: session._id || session.id || '',
    name: session.title,
    description: session.topic,
    timestamp: formatTimestamp(session.updatedAt),
    isPinned: session.isPinned,
    isFavorite: session.isFavorite,
    isArchived: session.status === 'archived',
    messageCount: session.messages?.length || 0,
  }
}

// ============================================================================
// Rename Session Dialog
// ============================================================================

export interface RenameSessionDialogProps {
  session: AISession | null
  isOpen: boolean
  onClose: () => void
  onSave: (sessionId: string, data: { name?: string; description?: string }) => Promise<void>
  isLoading?: boolean
}

export function RenameSessionDialog({
  session,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: RenameSessionDialogProps) {
  return (
    <EditConversationDialog
      item={sessionToConversationItem(session)}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      isLoading={isLoading}
      context="ai"
      showDescription={true}
      showAvatar={false}
      labels={{
        editLabel: 'Rename Session',
        editTitle: 'Rename AI Session',
        editDescription: 'Update the session title and topic.',
      }}
    />
  )
}

// ============================================================================
// Delete Session Confirmation Dialog
// ============================================================================

export interface DeleteSessionDialogProps {
  session: AISession | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (sessionId: string) => Promise<void>
  isLoading?: boolean
}

export function DeleteSessionDialog({
  session,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteSessionDialogProps) {
  return (
    <DeleteConversationDialog
      item={sessionToConversationItem(session)}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      context="ai"
      labels={{
        deleteTitle: 'Delete AI Session?',
        deleteDescription: 'This will permanently delete this AI session and all messages. This action cannot be undone.',
      }}
    />
  )
}

// ============================================================================
// Archive Session Confirmation Dialog
// ============================================================================

export interface ArchiveSessionDialogProps {
  session: AISession | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (sessionId: string, isArchived: boolean) => Promise<void>
  isLoading?: boolean
}

export function ArchiveSessionDialog({
  session,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ArchiveSessionDialogProps) {
  return (
    <ArchiveConversationDialog
      item={sessionToConversationItem(session)}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      context="ai"
    />
  )
}
