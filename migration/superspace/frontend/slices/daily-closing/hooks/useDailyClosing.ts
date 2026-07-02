"use client"

import { useCallback, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "@/hooks/use-toast"
import type {
  CloseDayInput,
  ClosingStatus,
  DailyClosing,
  DailyClosingItem,
  DailyClosingSummary,
  OpenDayInput,
  RecordSalesInput,
  UpsertItemInput,
} from "../types"

/**
 * Daily Closing hook.
 *
 * Surfaces the 5-state workflow:
 *   open → recorded → closed → approved (+ disputed as manual branch).
 */
export function useDailyClosing(
  workspaceId: Id<"workspaces"> | null | undefined,
  opts: { branchId?: string; status?: ClosingStatus } = {},
) {
  const listQuery = useQuery(
    api.features.dailyClosing.queries.listClosings,
    workspaceId
      ? { workspaceId, branchId: opts.branchId, status: opts.status }
      : "skip",
  )

  const summaryQuery = useQuery(
    api.features.dailyClosing.queries.getSummary,
    workspaceId ? { workspaceId } : "skip",
  )

  const openMutation = useMutation(api.features.dailyClosing.mutations.openDay)
  const recordMutation = useMutation(api.features.dailyClosing.mutations.recordSales)
  const upsertItemMutation = useMutation(api.features.dailyClosing.mutations.upsertItem)
  const closeMutation = useMutation(api.features.dailyClosing.mutations.closeDay)
  const approveMutation = useMutation(
    api.features.dailyClosing.mutations.approveClosing,
  )
  const deleteMutation = useMutation(
    api.features.dailyClosing.mutations.deleteClosing,
  )

  const items = useMemo<DailyClosing[]>(
    () => ((listQuery ?? []) as DailyClosing[]),
    [listQuery],
  )
  const summary = summaryQuery as DailyClosingSummary | undefined
  const isLoading = workspaceId ? listQuery === undefined : false

  const openDay = useCallback(
    async (input: OpenDayInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const result = await openMutation({
          workspaceId,
          businessDate: input.businessDate,
          branchId: input.branchId,
        })
        toast({ title: "Day opened", description: input.businessDate })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to open day"
        toast({ title: "Open failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, openMutation],
  )

  const recordSales = useCallback(
    async (closingId: Id<"dailyClosings">, input: RecordSalesInput) => {
      if (!workspaceId) return
      try {
        await recordMutation({
          workspaceId,
          closingId,
          cashSales: input.cashSales,
          cardSales: input.cardSales,
          qrisSales: input.qrisSales,
          otherSales: input.otherSales,
        })
        toast({ title: "Sales recorded" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to record sales"
        toast({
          title: "Record sales failed",
          description: msg,
          variant: "destructive",
        })
      }
    },
    [workspaceId, recordMutation],
  )

  const upsertItem = useCallback(
    async (closingId: Id<"dailyClosings">, input: UpsertItemInput) => {
      if (!workspaceId) return
      try {
        await upsertItemMutation({
          workspaceId,
          closingId,
          paymentMethod: input.paymentMethod,
          expectedAmount: input.expectedAmount,
          actualAmount: input.actualAmount,
          notes: input.notes,
        })
        toast({ title: "Item saved", description: input.paymentMethod })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to save item"
        toast({ title: "Save failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, upsertItemMutation],
  )

  const closeDay = useCallback(
    async (closingId: Id<"dailyClosings">, input: CloseDayInput) => {
      if (!workspaceId) return
      try {
        await closeMutation({
          workspaceId,
          closingId,
          actualCash: input.actualCash,
          closingNotes: input.closingNotes,
        })
        toast({ title: "Day closed" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to close day"
        toast({ title: "Close failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, closeMutation],
  )

  const approveClosing = useCallback(
    async (closingId: Id<"dailyClosings">) => {
      if (!workspaceId) return
      try {
        await approveMutation({ workspaceId, closingId })
        toast({ title: "Closing approved" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to approve"
        toast({ title: "Approve failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, approveMutation],
  )

  const deleteClosing = useCallback(
    async (closingId: Id<"dailyClosings">) => {
      if (!workspaceId) return
      try {
        await deleteMutation({ workspaceId, closingId })
        toast({ title: "Closing deleted" })
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
    openDay,
    recordSales,
    upsertItem,
    closeDay,
    approveClosing,
    deleteClosing,
  }
}

/**
 * Hook for the items of a specific closing. Separate query so the list view
 * doesn't fetch items for every row.
 */
export function useDailyClosingItems(
  workspaceId: Id<"workspaces"> | null | undefined,
  closingId: Id<"dailyClosings"> | null | undefined,
) {
  const q = useQuery(
    api.features.dailyClosing.queries.listItems,
    workspaceId && closingId ? { workspaceId, closingId } : "skip",
  )
  return {
    items: ((q ?? []) as DailyClosingItem[]),
    isLoading: workspaceId && closingId ? q === undefined : false,
  }
}

/**
 * The wizard steps, in canonical order.
 */
export const WIZARD_STEPS = ["open", "sales", "variance", "close", "approve"] as const
export type WizardStep = (typeof WIZARD_STEPS)[number]

/**
 * Return the next logical workflow step for a given closing status.
 * "approved" has no next step — UI should render read-only review.
 */
export function nextStep(status: ClosingStatus): WizardStep {
  switch (status) {
    case "open":
      return "sales"
    case "recorded":
      return "variance"
    case "closed":
      return "approve"
    case "approved":
      return "approve"
    case "disputed":
      return "approve"
  }
}

/**
 * Which wizard step corresponds to the "current work" given a status.
 * Used to auto-select the stepper tab in the drawer.
 */
export function currentStep(status: ClosingStatus): WizardStep {
  switch (status) {
    case "open":
      return "sales"
    case "recorded":
      return "variance"
    case "closed":
      return "approve"
    case "approved":
      return "approve"
    case "disputed":
      return "approve"
  }
}

export type {
  DailyClosing,
  DailyClosingItem,
  DailyClosingSummary,
  ClosingStatus,
}
