/**
 * Communications View
 * 
 * Main view for the communications feature with premium UI.
 * Uses unified CommunicationSidebar for both channels and DMs.
 * 
 * @module features/communications/views
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Shared layout components - SSOT
import {
  FeatureThreeColumnLayout,
} from "@/frontend/shared/ui/layout/container"

// Communications store
import {
  useCommunicationsStore,
  useSelectedChannelId,
  useSelectedDirectId,
  useActiveCall,
  useViewMode,
  useRightPanelOpen,
} from "../shared"

// Section components
import { CommunicationSidebar } from "../sections/CommunicationSidebar"
import { MessageArea } from "../sections/MessageArea"
import { InspectorPanel } from "../sections/InspectorPanel"
import { CallView } from "../sections/CallView"

// Empty state component
function EmptyState({
  title = "No selection",
  description = "Select a channel or conversation to start"
}: {
  title?: string
  description?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

interface CommunicationsViewProps {
  /** Initial view mode */
  defaultMode?: "channel" | "dm" | "call"
  /** Additional class names */
  className?: string
}

/**
 * Main Communications View
 * 
 * Uses unified CommunicationSidebar for both channels and DMs.
 * Same layout structure regardless of view mode (DRY).
 */
export function CommunicationsView({
  defaultMode = "channel",
  className,
}: CommunicationsViewProps) {
  // Store state
  const viewMode = useViewMode()
  const selectedChannelId = useSelectedChannelId()
  const selectedDirectId = useSelectedDirectId()
  const activeCall = useActiveCall()
  const rightPanelOpen = useRightPanelOpen()

  const setViewMode = useCommunicationsStore(state => state.setViewMode)

  // Set initial mode
  React.useEffect(() => {
    if (defaultMode) {
      setViewMode(defaultMode)
    }
  }, [defaultMode, setViewMode])

  // Determine selections
  const hasChannelSelection = !!selectedChannelId
  const hasDirectSelection = !!selectedDirectId
  const hasCallActive = !!activeCall

  // Determine current sidebar mode
  const sidebarMode = viewMode === "dm" ? "dms" : "channels"

  // Determine if we have a valid selection for current mode
  const hasSelection = viewMode === "dm" ? hasDirectSelection : hasChannelSelection

  // Active call overlay takes precedence
  if (hasCallActive && viewMode === "call") {
    return (
      <div className={cn("h-full w-full", className)}>
        <CallView />
      </div>
    )
  }

  // Unified layout for both channels and DMs (DRY)
  return (
    <FeatureThreeColumnLayout
      preset="feature"
      storageKey="communications-layout"
      leftLabel="Channels"
      centerLabel={viewMode === "dm" ? "Conversation" : "Messages"}
      rightLabel="Inspector"
      className={cn("h-full overflow-hidden", className)}
      persistState
      sidebarContent={
        <CommunicationSidebar
          mode={sidebarMode}
        />
      }
      mainContent={
        hasSelection ? (
          <MessageArea type={viewMode === "dm" ? "direct" : "channel"} />
        ) : (
          <EmptyState
            title={viewMode === "dm" ? "No conversation selected" : "No channel selected"}
            description={viewMode === "dm"
              ? "Select a conversation from the sidebar"
              : "Select a channel from the sidebar"
            }
          />
        )
      }
      inspector={
        rightPanelOpen && hasSelection ? (
          <InspectorPanel />
        ) : null
      }
      rightWidth={280}
    />
  )
}

export default CommunicationsView
