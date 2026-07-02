"use client"

import { useCallback, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "@/hooks/use-toast"
import type {
  CreateTransferInput,
  OwnerTransfer,
  OwnerTransferSummary,
  TransferStatus,
} from "../types"

/**
 * Owner Transfers hook.
 *
 * Surfaces the three-state workflow (pending → approved → reconciled) and
 * the 4 transfer types (withdraw / inject / loan / repayment) against the
 * `ownerTransfers` Convex domain.
 */
export function useOwnerTransfers(workspaceId: Id<"workspaces"> | null | undefined) {
  const listQuery = useQuery(
    api.features.ownerTransfers.queries.listTransfers,
    workspaceId ? { workspaceId } : "skip",
  )

  const summaryQuery = useQuery(
    api.features.ownerTransfers.queries.getSummary,
    workspaceId ? { workspaceId } : "skip",
  )

  const createMutation = useMutation(api.features.ownerTransfers.mutations.createTransfer)
  const approveMutation = useMutation(api.features.ownerTransfers.mutations.approveTransfer)
  const reconcileMutation = useMutation(api.features.ownerTransfers.mutations.reconcileTransfer)

  const items = useMemo<OwnerTransfer[]>(
    () => ((listQuery ?? []) as OwnerTransfer[]),
    [listQuery],
  )
  const summary = summaryQuery as OwnerTransferSummary | undefined

  const isLoading = workspaceId ? listQuery === undefined : false

  const createTransfer = useCallback(
    async (input: CreateTransferInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const result = await createMutation({
          workspaceId,
          type: input.type,
          amount: input.amount,
          currency: input.currency,
          fromAccount: input.fromAccount,
          toAccount: input.toAccount,
          ownerUserId: input.ownerUserId as Id<"users">,
          transferDate: input.transferDate,
          branchId: input.branchId,
          category: input.category,
          notes: input.notes,
        })
        toast({ title: "Transfer created", description: "Pending approval." })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create transfer"
        toast({ title: "Create failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, createMutation],
  )

  const approveTransfer = useCallback(
    async (transferId: Id<"ownerTransfers">) => {
      if (!workspaceId) return
      try {
        await approveMutation({ workspaceId, transferId })
        toast({ title: "Transfer approved" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to approve"
        toast({ title: "Approve failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, approveMutation],
  )

  const reconcileTransfer = useCallback(
    async (transferId: Id<"ownerTransfers">) => {
      if (!workspaceId) return
      try {
        await reconcileMutation({ workspaceId, transferId })
        toast({ title: "Transfer reconciled" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to reconcile"
        toast({ title: "Reconcile failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, reconcileMutation],
  )

  return {
    items,
    summary,
    isLoading,
    createTransfer,
    approveTransfer,
    reconcileTransfer,
  }
}

/**
 * Legal state transitions for an owner transfer. Consumed by the detail
 * drawer to show only the buttons the current status permits.
 */
export function availableActions(
  status: TransferStatus,
): Array<{ id: "approve" | "reconcile"; label: string }> {
  switch (status) {
    case "pending":
      return [{ id: "approve", label: "Approve" }]
    case "approved":
      return [{ id: "reconcile", label: "Reconcile" }]
    default:
      return []
  }
}

export type { OwnerTransfer, OwnerTransferSummary, TransferStatus }
