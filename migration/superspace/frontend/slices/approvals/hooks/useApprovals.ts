import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"
import type { ApprovalsData } from "../types"

// Initial empty data for real Approvals usage
const INITIAL_DATA: ApprovalsData = {
  stats: {
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    avgTime: '-'
  },
  recentRequests: [],
  pendingRequests: []
}

export interface UseApprovalsReturn {
  isLoading: boolean
  data: ApprovalsData
  approveRequest: (requestId: string, comment?: string) => Promise<void>
  rejectRequest: (requestId: string, reason?: string) => Promise<void>
}

/**
 * Hook for Approvals feature
 * Provides data and mutations for approval workflows
 */
export function useApprovals(workspaceId: Id<"workspaces"> | null | undefined): UseApprovalsReturn {
  const remoteData = useQuery(
    api.features.approvals.queries.getData,
    workspaceId ? { workspaceId } : "skip"
  )

  const approveMutation = useMutation(api.features.approvals.mutations.approveRequest)
  const rejectMutation = useMutation(api.features.approvals.mutations.rejectRequest)

  const approveRequest = async (requestId: string, comment?: string) => {
    if (!workspaceId) throw new Error("No workspace selected")
    await approveMutation({
      workspaceId,
      requestId: requestId as Id<"approvalRequests">,
      comment,
    })
  }

  const rejectRequest = async (requestId: string, reason?: string) => {
    if (!workspaceId) throw new Error("No workspace selected")
    await rejectMutation({
      workspaceId,
      requestId: requestId as Id<"approvalRequests">,
      reason,
    })
  }

  return {
    isLoading: remoteData === undefined && workspaceId !== null && workspaceId !== undefined,
    data: (remoteData as unknown as ApprovalsData) || INITIAL_DATA,
    approveRequest,
    rejectRequest,
  }
}

