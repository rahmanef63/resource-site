"use client"

import React from "react"
import { Id } from "@convex/_generated/dataModel"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { useAuditLog } from "../hooks/useAuditLog"
import AuditLogDashboard from "../components/AuditLogDashboard"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"

interface AuditLogPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Audit Log Page Component
 * 
 * Pattern: Feature page with shared layout components
 * Uses AuditLogDashboard for presentation
 */
export default function AuditLogPage({ workspaceId }: AuditLogPageProps) {
  const { isLoading, data } = useAuditLog(workspaceId)

  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Audit Logs
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <FeatureShell featureId="audit-log" padding={false}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto p-6">
          <AuditLogDashboard data={data} isLoading={isLoading} />
        </div>
      </div>
    </FeatureShell>
  )
}
