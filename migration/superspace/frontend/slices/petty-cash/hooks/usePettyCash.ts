"use client"

import { useCallback, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "@/hooks/use-toast"
import type {
  CloseInput,
  CreateRequestInput,
  DisburseInput,
  PettyCashRequest,
  PettyCashSummary,
  RejectInput,
  RequestStatus,
} from "../types"

/**
 * Petty Cash hook.
 *
 * Surfaces the 6-state workflow (pending → approved → disbursed → closed,
 * with rejected/cancelled terminals) against the `pettyCashRequests` +
 * `pettyCashDisbursements` Convex domain.
 */
export function usePettyCash(workspaceId: Id<"workspaces"> | null | undefined) {
  const listQuery = useQuery(
    api.features.pettyCash.queries.listRequests,
    workspaceId ? { workspaceId } : "skip",
  )

  const summaryQuery = useQuery(
    api.features.pettyCash.queries.getSummary,
    workspaceId ? { workspaceId } : "skip",
  )

  const createMutation = useMutation(api.features.pettyCash.mutations.createRequest)
  const approveMutation = useMutation(api.features.pettyCash.mutations.approveRequest)
  const rejectMutation = useMutation(api.features.pettyCash.mutations.rejectRequest)
  const disburseMutation = useMutation(api.features.pettyCash.mutations.disburseRequest)
  const closeMutation = useMutation(api.features.pettyCash.mutations.closeRequest)
  const cancelMutation = useMutation(api.features.pettyCash.mutations.cancelRequest)
  const deleteMutation = useMutation(api.features.pettyCash.mutations.deleteRequest)

  const items = useMemo<PettyCashRequest[]>(
    () => ((listQuery ?? []) as PettyCashRequest[]),
    [listQuery],
  )
  const summary = summaryQuery as PettyCashSummary | undefined

  const isLoading = workspaceId ? listQuery === undefined : false

  const createRequest = useCallback(
    async (input: CreateRequestInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const result = await createMutation({
          workspaceId,
          branchId: input.branchId,
          amount: input.amount,
          currency: input.currency,
          purpose: input.purpose,
          category: input.category,
          notes: input.notes,
          attachments: input.attachments,
        })
        toast({ title: "Request created", description: "Pending approval." })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create request"
        toast({ title: "Create failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, createMutation],
  )

  const approveRequest = useCallback(
    async (requestId: Id<"pettyCashRequests">) => {
      if (!workspaceId) return
      try {
        await approveMutation({ workspaceId, requestId })
        toast({ title: "Request approved" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to approve"
        toast({ title: "Approve failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, approveMutation],
  )

  const rejectRequest = useCallback(
    async (requestId: Id<"pettyCashRequests">, input: RejectInput) => {
      if (!workspaceId) return
      try {
        await rejectMutation({ workspaceId, requestId, reason: input.reason })
        toast({ title: "Request rejected" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to reject"
        toast({ title: "Reject failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, rejectMutation],
  )

  const disburseRequest = useCallback(
    async (requestId: Id<"pettyCashRequests">, input: DisburseInput) => {
      if (!workspaceId) return
      try {
        await disburseMutation({
          workspaceId,
          requestId,
          method: input.method,
          receiptUrl: input.receiptUrl,
        })
        toast({ title: "Request disbursed" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to disburse"
        toast({ title: "Disburse failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, disburseMutation],
  )

  const closeRequest = useCallback(
    async (requestId: Id<"pettyCashRequests">, input: CloseInput) => {
      if (!workspaceId) return
      try {
        await closeMutation({
          workspaceId,
          requestId,
          actualAmount: input.actualAmount,
          closingNotes: input.closingNotes,
        })
        toast({ title: "Request closed" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to close"
        toast({ title: "Close failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, closeMutation],
  )

  const cancelRequest = useCallback(
    async (requestId: Id<"pettyCashRequests">) => {
      if (!workspaceId) return
      try {
        await cancelMutation({ workspaceId, requestId })
        toast({ title: "Request cancelled" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to cancel"
        toast({ title: "Cancel failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, cancelMutation],
  )

  const deleteRequest = useCallback(
    async (requestId: Id<"pettyCashRequests">) => {
      if (!workspaceId) return
      try {
        await deleteMutation({ workspaceId, requestId })
        toast({ title: "Request deleted" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to delete"
        toast({ title: "Delete failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, deleteMutation],
  )

  return {
    items,
    summary,
    isLoading,
    createRequest,
    approveRequest,
    rejectRequest,
    disburseRequest,
    closeRequest,
    cancelRequest,
    deleteRequest,
  }
}

export type RequestAction =
  | "approve"
  | "reject"
  | "disburse"
  | "close"
  | "cancel"

/**
 * Legal state transitions for a petty cash request. Consumed by the detail
 * drawer to show only the actions the current status permits.
 */
export function availableActions(
  status: RequestStatus,
): Array<{ id: RequestAction; label: string }> {
  switch (status) {
    case "pending":
      return [
        { id: "approve", label: "Approve" },
        { id: "reject", label: "Reject" },
        { id: "cancel", label: "Cancel" },
      ]
    case "approved":
      return [
        { id: "disburse", label: "Disburse" },
        { id: "cancel", label: "Cancel" },
      ]
    case "disbursed":
      return [{ id: "close", label: "Close" }]
    default:
      return []
  }
}

export type { PettyCashRequest, PettyCashSummary, RequestStatus }
