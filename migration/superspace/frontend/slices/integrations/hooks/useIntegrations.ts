import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import { ConnectedIntegration, IntegrationsData } from "../types"

/**
 * Hook for Integrations feature
 */
export function useIntegrations(workspaceId: Id<"workspaces"> | null | undefined): IntegrationsData & { connectIntegration: any, disconnectIntegration: any } {
  const integrationsQuery = useQuery(
    api.features.integrations.queries.getIntegrations,
    workspaceId ? { workspaceId } : "skip"
  )

  const connectIntegration = useMutation(api.features.integrations.mutations.connect)
  const disconnectIntegration = useMutation(api.features.integrations.mutations.disconnect)

  const integrations: ConnectedIntegration[] = (integrationsQuery as any[])?.map(i => ({
    _id: i._id,
    integrationId: i.integrationId,
    workspaceId: i.workspaceId,
    status: i.status as any,
    createdAt: i._creationTime,
    lastSyncAt: i.lastSyncAt,
    config: i.config
  })) ?? []

  return {
    isLoading: integrationsQuery === undefined && workspaceId !== null && workspaceId !== undefined,
    integrations,
    stats: {
      totalConnected: integrations.length,
      activeIntegrations: integrations.filter(i => i.status === 'active').length,
      totalAvailable: 12 // hardcoded matching constant
    },
    connectIntegration,
    disconnectIntegration,
  }
}
