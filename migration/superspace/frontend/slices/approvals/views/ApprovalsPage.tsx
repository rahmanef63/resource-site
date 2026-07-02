"use client"

import React from "react"
import { Id } from "@convex/_generated/dataModel"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { useApprovals } from "../hooks/useApprovals"
import ApprovalsDashboard from "../components/ApprovalsDashboard"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"

interface ApprovalsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Approvals Page Component
 * 
 * Pattern: Feature page with shared layout components
 * Uses ApprovalsDashboard for presentation
 */
export default function ApprovalsPage({ workspaceId }: ApprovalsPageProps) {
  const { isLoading, data, approveRequest, rejectRequest } = useApprovals(workspaceId)

  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Approvals
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <FeatureShell featureId="approvals" padding={false}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto p-6">
          <ApprovalsDashboard
            data={data}
            isLoading={isLoading}
            onApprove={approveRequest}
            onReject={rejectRequest}
          />
        </div>
      </div>
    </FeatureShell>
  )
}

