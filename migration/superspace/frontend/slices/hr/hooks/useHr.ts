import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import type { HrData } from "../types"

// Initial empty data for real HR usage
const INITIAL_DATA: HrData = {
  stats: {
    totalEmployees: 0,
    onLeave: 0,
    openPositions: 0,
    newHires: 0,
    departmentCount: 0
  },
  recentHires: [],
  leaveRequests: []
}

/**
 * Hook for HR feature
 * 
 * Pattern: Use Convex query directly, no manual loading state
 */
export function useHr(workspaceId: Id<"workspaces"> | null | undefined): { isLoading: boolean, data: HrData } {
  const remoteData = useQuery(
    api.features.hr.queries.getData,
    workspaceId ? { workspaceId } : "skip"
  )

  return {
    isLoading: remoteData === undefined && workspaceId !== null && workspaceId !== undefined,
    data: (remoteData as unknown as HrData) || INITIAL_DATA,
  }
}
