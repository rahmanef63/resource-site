"use client"

// @dod:skip-uiux013 reason="bi: loading/empty/error states surface in nested subcomponents (cards, lists, dialogs) — view file is a layout host, not a data terminal"

import React from "react"
import { LineChart } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useBi } from "../hooks/useBi"
import { BiDashboard } from "../components/BiDashboard"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"

interface BiPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * BI Page Component
 */
export default function BiPage({ workspaceId }: BiPageProps) {
  const data = useBi(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to use BI
          </p>
        </div>
      </div>
    )
  }

  return (
    <FeatureShell featureId="bi" padding={false}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto p-4">
          <BiDashboard data={data} />
        </div>
      </div>
    </FeatureShell>
  )
}
