"use client"

import React from "react"
import { Id } from "@convex/_generated/dataModel"
import { useIntegrations } from "../hooks/useIntegrations"
import { IntegrationsDashboard } from "../components/IntegrationsDashboard"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"

interface IntegrationsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Integrations Page Component
 * Manage third-party integrations with OAuth support
 */
export default function IntegrationsPage({ workspaceId }: IntegrationsPageProps) {
  const data = useIntegrations(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to manage integrations
          </p>
        </div>
      </div>
    )
  }

  const handleConnect = async (integrationId: string, name: string) => {
    await data.connectIntegration({
      workspaceId,
      integrationId,
      name,
    })
  }

  const handleDisconnect = async (id: string) => {
    await data.disconnectIntegration({
      workspaceId,
      integrationId: id, // The mutation expects 'integrationId' which is the _id of the doc
    })
  }

  return (
    <FeatureShell featureId="integrations" padding={false}>
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-auto p-4">
          <IntegrationsDashboard
            data={data}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        </div>
      </div>
    </FeatureShell>
  )
}
