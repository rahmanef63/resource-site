"use client"

// @dod:skip-uiux013 reason="accounting: loading/empty/error states surface in nested subcomponents (cards, lists, dialogs) — view file is a layout host, not a data terminal"

import React from "react"
import { Id } from "@convex/_generated/dataModel"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { useAccounting } from "../hooks/useAccounting"
import AccountingDashboard from "../components/AccountingDashboard"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"

interface AccountingPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Accounting Page Component
 * 
 * Pattern: Feature page with shared layout components
 * Uses AccountingDashboard for presentation
 */
export default function AccountingPage({ workspaceId }: AccountingPageProps) {
  // Use hook with workspaceId - this is the correct pattern
  const { isLoading, data } = useAccounting(workspaceId)

  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Accounting
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <FeatureShell featureId="accounting" padding={false}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto p-6">
          <AccountingDashboard data={data} isLoading={isLoading} />
        </div>
      </div>
    </FeatureShell>
  )
}
