/**
 * Communications Page
 * 
 * Main page component for the unified communications feature.
 * Wraps CommunicationsView with workspace context and providers.
 * 
 * @module features/communications/views
 */

import { FeatureSkeletons } from "@/frontend/shared/ui/components/loading/FeatureSkeletons"

import * as React from "react"
import type { Id } from "@convex/_generated/dataModel"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CommunicationsView } from "./CommunicationsView"
import { useCommunications } from "../hooks/useCommunications"
import { useCommunicationWorkspace } from "../hooks/useCommunicationWorkspace"
import { CreateChannelDialog } from "../components/CreateChannelDialog"
import { useCommunicationsStore } from "../shared"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"

interface CommunicationsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Communications Page Component
 * 
 * Pattern: Feature page with shared layout components
 * @see docs/guides/FEATURE_CREATION_TEMPLATE.md
 */
export default function CommunicationsPage({ workspaceId }: CommunicationsPageProps) {
  const workspaceIdString = workspaceId ? String(workspaceId) : null
  const setCommunicationWorkspace = useCommunicationsStore(
    state => state.setCommunicationWorkspace
  )
  const activeModal = useCommunicationsStore(state => state.ui.activeModal)
  const closeModal = useCommunicationsStore(state => state.closeModal)
  const { activeWorkspaceId } = useCommunicationWorkspace()
  const { isLoading } = useCommunications(activeWorkspaceId)

  React.useEffect(() => {
    if (workspaceIdString) {
      setCommunicationWorkspace(workspaceIdString)
    }
  }, [setCommunicationWorkspace, workspaceIdString])

  // Handle loading
  if (isLoading) {
    return <FeatureSkeletons.Chat />
  }

  // Main content
  return (
    <FeatureShell featureId="communications" padding={false}>
      <TooltipProvider>
        <div className="flex h-full flex-col">
          <CommunicationsView className="flex-1" />
          {/* Create Channel Modal */}
          <CreateChannelDialog
            open={activeModal === "create-channel"}
            onOpenChange={(open) => !open && closeModal()}
          />
        </div>
      </TooltipProvider>
    </FeatureShell>
  )
}
