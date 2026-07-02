"use client"

// @dod:skip-uiux013 reason="pos: loading/empty/error states surface in nested subcomponents (cards, lists, dialogs) — view file is a layout host, not a data terminal"

import React from "react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { usePos } from "../hooks/usePos"
import PosDashboard from "../components/PosDashboard"
import { PosEmptyStateWizard } from "../components/PosEmptyStateWizard"

interface PosPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const STORAGE_KEY = "ss_pos_skip_wizard"

export default function PosPage({ workspaceId }: PosPageProps) {
  const { isLoading, data } = usePos(workspaceId)
  const [forceDashboard, setForceDashboard] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined" || !workspaceId) return
    const skipped = window.sessionStorage.getItem(`${STORAGE_KEY}:${workspaceId}`)
    if (skipped === "1") setForceDashboard(true)
  }, [workspaceId])

  if (!workspaceId) {
    return (
      <FeatureShell featureId="pos" centered padding>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view POS
          </p>
        </div>
      </FeatureShell>
    )
  }

  const isEmpty =
    !isLoading &&
    data.popularProducts.length === 0 &&
    data.recentTransactions.length === 0 &&
    data.stats.transactionCount === 0

  const handleSkipWizard = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(`${STORAGE_KEY}:${workspaceId}`, "1")
    }
    setForceDashboard(true)
  }

  if (isEmpty && !forceDashboard) {
    return (
      <FeatureShell featureId="pos" padding={false}>
        <div className="flex h-full flex-col overflow-y-auto">
          <PosEmptyStateWizard onSkip={handleSkipWizard} onComplete={handleSkipWizard} />
        </div>
      </FeatureShell>
    )
  }

  return (
    <FeatureShell featureId="pos" padding={false}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto p-6">
          <PosDashboard data={data} isLoading={isLoading} />
        </div>
      </div>
    </FeatureShell>
  )
}
