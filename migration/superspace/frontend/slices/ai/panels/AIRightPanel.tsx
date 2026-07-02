"use client"

/**
 * AI Right Panel - Session Info
 * 
 * Right column panel for the AI feature.
 * Uses the shared SessionInfoTabs component with debug tracing.
 */

import { SessionInfoTabs } from "@/frontend/shared/ui/components/session-info"
import type { AISession } from "../stores"

// ============================================================================
// Types
// ============================================================================

export type AIRightPanelSection = "overview" | "content" | "settings" | "knowledge" | "export" | "debug"

export interface AIRightPanelProps {
  /** The current AI session */
  session: AISession | null
  /** Callback when panel is closed */
  onClose?: () => void
  /** Callback when session is deleted */
  onDelete?: () => void
  /** Callback when session is exported */
  onExport?: (format: "json" | "markdown" | "pdf") => void
  /** Callback when session is shared */
  onShare?: () => void
  /** Callback when title is updated */
  onUpdateTitle?: (title: string) => void
  /** Callback when knowledge toggle changes */
  onKnowledgeToggle?: (enabled: boolean) => void
  /** Whether knowledge is enabled */
  knowledgeEnabled?: boolean
  /** Optional className for styling */
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function AIRightPanel({
  session,
  onClose,
  onDelete,
  onExport,
  onShare,
  onUpdateTitle,
  onKnowledgeToggle,
  knowledgeEnabled,
  className,
}: AIRightPanelProps) {
  // Convert AISession to GenericSession format
  const genericSession = session ? {
    _id: session._id,
    id: session.id,
    title: session.title,
    icon: session.icon,
    topic: session.topic,
    status: session.status,
    messages: session.messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: m.timestamp,
      metadata: m.metadata,
    })),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    metadata: session.metadata,
  } : null

  return (
    <SessionInfoTabs
      session={genericSession}
      tabs={["overview", "content", "settings", "knowledge", "export", "debug"]}
      defaultTab="overview"
      onClose={onClose}
      onDelete={onDelete}
      onExport={onExport}
      onShare={onShare}
      onUpdateTitle={onUpdateTitle}
      onKnowledgeToggle={onKnowledgeToggle}
      knowledgeEnabled={knowledgeEnabled}
      className={className}
      compact={true}
    />
  )
}

export default AIRightPanel
