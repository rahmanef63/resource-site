"use client"

import { useCallback, useMemo } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "@/hooks/use-toast"
import type {
  AddLineItemInput,
  CreateForecastInput,
  Forecast,
  ForecastStatus,
  ForecastSummary,
} from "../types"

/**
 * Cash Flow Forecast hook.
 *
 * Surfaces the draft → published workflow against the `cashFlowForecasts` +
 * `cashFlowLineItems` Convex domain. Returns a list of forecasts, an optional
 * loaded detail (forecast + bucketed line items), and the latest published
 * snapshot for the stats strip.
 */
export function useCashFlowForecasts(
  workspaceId: Id<"workspaces"> | null | undefined,
  options?: {
    status?: ForecastStatus | "all"
    selectedForecastId?: Id<"cashFlowForecasts"> | null
  },
) {
  const status = options?.status
  const selectedForecastId = options?.selectedForecastId ?? null

  const listQuery = useQuery(
    api.features.cashFlowForecast.queries.listForecasts,
    workspaceId
      ? { workspaceId, status: status && status !== "all" ? status : undefined }
      : "skip",
  )

  const latestPublishedQuery = useQuery(
    api.features.cashFlowForecast.queries.getLatestPublished,
    workspaceId ? { workspaceId } : "skip",
  )

  const detailQuery = useQuery(
    api.features.cashFlowForecast.queries.getForecast,
    workspaceId && selectedForecastId
      ? { workspaceId, forecastId: selectedForecastId }
      : "skip",
  )

  const createForecastMutation = useMutation(
    api.features.cashFlowForecast.mutations.createForecast,
  )
  const addLineItemMutation = useMutation(
    api.features.cashFlowForecast.mutations.addLineItem,
  )
  const publishForecastMutation = useMutation(
    api.features.cashFlowForecast.mutations.publishForecast,
  )

  const forecasts = useMemo<ForecastSummary[]>(
    () => ((listQuery ?? []) as ForecastSummary[]),
    [listQuery],
  )
  const latestPublished = (latestPublishedQuery ?? null) as ForecastSummary | null
  const selectedForecast = (detailQuery ?? null) as Forecast | null

  const isLoading = workspaceId ? listQuery === undefined : false
  const isDetailLoading = Boolean(
    workspaceId && selectedForecastId && detailQuery === undefined,
  )

  const createForecast = useCallback(
    async (input: CreateForecastInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const result = await createForecastMutation({
          workspaceId,
          branchId: input.branchId,
          horizonDays: input.horizonDays,
          startDate: input.startDate,
          endDate: input.endDate,
          baseCash: input.baseCash,
          generationSource: input.generationSource,
          aiNotes: input.aiNotes,
        })
        toast({ title: "Forecast created", description: "Draft ready — add line items to refine projections." })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create forecast"
        toast({ title: "Create failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, createForecastMutation],
  )

  const addLineItem = useCallback(
    async (forecastId: Id<"cashFlowForecasts">, input: AddLineItemInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const result = await addLineItemMutation({
          workspaceId,
          forecastId,
          bucket: input.bucket,
          label: input.label,
          amount: input.amount,
          probability: input.probability,
          expectedDate: input.expectedDate,
          note: input.note,
        })
        toast({ title: "Line item added" })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to add line item"
        toast({ title: "Add item failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, addLineItemMutation],
  )

  const publishForecast = useCallback(
    async (forecastId: Id<"cashFlowForecasts">) => {
      if (!workspaceId) return
      try {
        await publishForecastMutation({ workspaceId, forecastId })
        toast({ title: "Forecast published" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to publish"
        toast({ title: "Publish failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, publishForecastMutation],
  )

  return {
    forecasts,
    latestPublished,
    selectedForecast,
    isLoading,
    isDetailLoading,
    createForecast,
    addLineItem,
    publishForecast,
  }
}

export type { Forecast, ForecastSummary, ForecastStatus }
