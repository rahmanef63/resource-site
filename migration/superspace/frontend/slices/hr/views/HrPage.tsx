"use client"

// @dod:skip-uiux013 reason="hr: loading/empty/error states surface in nested subcomponents (cards, lists, dialogs) — view file is a layout host, not a data terminal"

import React from "react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { useHr } from "../hooks/useHr"
import HrDashboard from "../components/HrDashboard"

interface HrPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function HrPage({ workspaceId }: HrPageProps) {
  const { isLoading, data } = useHr(workspaceId)

  if (!workspaceId) {
    return (
      <FeatureShell featureId="hr" padding>
        <div className="flex h-full items-center justify-center text-center p-8">
          <div>
            <h2 className="text-xl font-semibold">No Workspace Selected</h2>
            <p className="mt-2 text-muted-foreground">
              Please select a workspace to view HR Management
            </p>
          </div>
        </div>
      </FeatureShell>
    )
  }

  return (
    <FeatureShell featureId="hr" padding={false}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto p-6">
          <HrDashboard data={data} isLoading={isLoading} />
        </div>
      </div>
    </FeatureShell>
  )
}
