"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { OverviewViewBlocks } from "./OverviewViewBlocks"
import { WorkspaceIntelligenceOverview } from "./WorkspaceIntelligenceOverview"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"

interface OverviewPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function OverviewPage({ workspaceId }: OverviewPageProps) {
  const {
    isMainWorkspace,
    mainWorkspace,
    workspaceId: contextWorkspaceId,
  } = useWorkspaceContext()
  const activeWorkspaceId = workspaceId ?? contextWorkspaceId
  const isActiveMainWorkspace =
    !!activeWorkspaceId &&
    (!!mainWorkspace
      ? String(activeWorkspaceId) === String(mainWorkspace._id)
      : isMainWorkspace)

  return (
    <FeatureShell featureId="overview" aiPlaceholder="Ask about your workspace…">
      {isActiveMainWorkspace && activeWorkspaceId ? (
        <WorkspaceIntelligenceOverview workspaceId={activeWorkspaceId} />
      ) : (
        <OverviewViewBlocks workspaceId={activeWorkspaceId} />
      )}
    </FeatureShell>
  )
}
