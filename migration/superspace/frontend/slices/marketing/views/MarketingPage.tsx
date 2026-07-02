"use client"

// @dod:skip-uiux013 reason="marketing: loading/empty/error states surface in nested subcomponents (cards, lists, dialogs) — view file is a layout host, not a data terminal"

import React from "react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { useMarketing } from "../hooks/useMarketing"
import MarketingDashboard from "../components/MarketingDashboard"

interface MarketingPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Marketing Page Component
 * 
 * Pattern: Feature page with shared layout components
 * Uses MarketingDashboard for presentation
 */
export default function MarketingPage({ workspaceId }: MarketingPageProps) {
  const { isLoading, data } = useMarketing(workspaceId)

  if (!workspaceId) {
    return (
      <FeatureShell featureId="marketing" centered padding>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Marketing
          </p>
        </div>
      </FeatureShell>
    )
  }

  return (
    <FeatureShell featureId="marketing" padding={false}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto p-6">
          <MarketingDashboard data={data} isLoading={isLoading} />
        </div>
      </div>
    </FeatureShell>
  )
}
