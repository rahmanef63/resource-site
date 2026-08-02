"use client"

/**
 * AI Chat Panel
 * 
 * A chat interface component for the right panel of three-column layouts.
 * Uses the shared AgentChatContainer for consistent UI/UX across features.
 */

import { cn } from "@/lib/utils"
import { AgentChatContainer } from "@/frontend/shared/ui/ai-assistant/chat"

// ============================================================================
// Types
// ============================================================================

export interface AIChatPanelProps {
  /** Feature ID to filter agents (e.g., 'documents', 'tasks') */
  featureId: string
  /** Custom placeholder text */
  placeholder?: string
  /** Additional className */
  className?: string
  /** Context for the AI to understand current state */
  context?: {
    selectedDocumentId?: string
    selectedDocumentTitle?: string
    [key: string]: any
  }
  /** Show debug panel */
  showDebugPanel?: boolean
  /** Custom welcome message */
  welcomeMessage?: string
  /** Custom suggestions */
  suggestions?: string[]
}

// ============================================================================
// Component
// ============================================================================

export function AIChatPanel({
  featureId,
  placeholder,
  className,
  context,
  showDebugPanel = true,
  welcomeMessage,
  suggestions,
}: AIChatPanelProps) {
  return (
    <AgentChatContainer
      featureId={featureId}
      placeholder={placeholder}
      context={context}
      variant="compact"
      showRecentChats={false}
      showDebugPanel={showDebugPanel}
      welcomeMessage={welcomeMessage}
      suggestions={suggestions}
      className={cn("h-full", className)}
    />
  )
}

export default AIChatPanel
