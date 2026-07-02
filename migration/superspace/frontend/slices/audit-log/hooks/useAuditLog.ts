import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import type { AuditLogData } from "../types"

// Initial empty data for real Audit Log usage
const INITIAL_DATA: AuditLogData = {
  stats: {
    totalEvents: 0,
    criticalEvents: 0,
    activeUsers: 0,
    systemHealth: 'Unknown'
  },
  recentEvents: []
}

/**
 * Hook for Audit Log feature
 */
export function useAuditLog(workspaceId: Id<"workspaces"> | null | undefined): { isLoading: boolean, data: AuditLogData } {
  const remoteData = useQuery(
    api.features.auditLog.queries.getData,
    workspaceId ? { workspaceId } : "skip"
  )

  return {
    isLoading: remoteData === undefined && workspaceId !== null && workspaceId !== undefined,
    data: (remoteData as unknown as AuditLogData) || INITIAL_DATA,
  }
}
