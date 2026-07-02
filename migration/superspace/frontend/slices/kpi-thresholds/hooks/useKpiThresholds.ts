"use client"

import { useCallback, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "@/hooks/use-toast"
import type {
  AcknowledgeAlertInput,
  DefineThresholdInput,
  KpiAlert,
  KpiSummary,
  KpiThreshold,
} from "../types"

/**
 * KPI Thresholds hook.
 *
 * Surfaces the threshold-definition + alert-triage workflow against the
 * `kpiThresholds` + `kpiAlerts` Convex domain.
 */
export function useKpiThresholds(
  workspaceId: Id<"workspaces"> | null | undefined,
  options: { resolved?: boolean } = {},
) {
  const thresholdsQuery = useQuery(
    api.features.kpiThresholds.queries.listThresholds,
    workspaceId ? { workspaceId } : "skip",
  )

  const alertsQuery = useQuery(
    api.features.kpiThresholds.queries.listAlerts,
    workspaceId
      ? { workspaceId, ...(options.resolved !== undefined ? { resolved: options.resolved } : {}) }
      : "skip",
  )

  const summaryQuery = useQuery(
    api.features.kpiThresholds.queries.getSummary,
    workspaceId ? { workspaceId } : "skip",
  )

  const defineMutation = useMutation(api.features.kpiThresholds.mutations.defineThreshold)
  const toggleMutation = useMutation(api.features.kpiThresholds.mutations.toggleThreshold)
  const acknowledgeMutation = useMutation(
    api.features.kpiThresholds.mutations.acknowledgeAlert,
  )
  const triggerMutation = useMutation(api.features.kpiThresholds.mutations.triggerAlert)

  const thresholds = useMemo<KpiThreshold[]>(
    () => ((thresholdsQuery ?? []) as KpiThreshold[]),
    [thresholdsQuery],
  )
  const alerts = useMemo<KpiAlert[]>(
    () => ((alertsQuery ?? []) as KpiAlert[]),
    [alertsQuery],
  )
  const summary = summaryQuery as KpiSummary | undefined

  const isLoading = workspaceId
    ? thresholdsQuery === undefined || alertsQuery === undefined
    : false

  const defineThreshold = useCallback(
    async (input: DefineThresholdInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const result = await defineMutation({
          workspaceId,
          branchId: input.branchId,
          kpiKey: input.kpiKey,
          metric: input.metric,
          direction: input.direction,
          value1: input.value1,
          value2: input.value2,
          severity: input.severity,
          actionPolicy: input.actionPolicy,
        })
        toast({ title: "Threshold defined", description: `${input.metric} is now monitored.` })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to define threshold"
        toast({ title: "Define failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, defineMutation],
  )

  const toggleThreshold = useCallback(
    async (thresholdId: Id<"kpiThresholds">, isActive: boolean) => {
      if (!workspaceId) return
      try {
        await toggleMutation({ workspaceId, thresholdId, isActive })
        toast({ title: isActive ? "Threshold activated" : "Threshold paused" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to toggle threshold"
        toast({ title: "Toggle failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, toggleMutation],
  )

  const acknowledgeAlert = useCallback(
    async (alertId: Id<"kpiAlerts">, input: AcknowledgeAlertInput) => {
      if (!workspaceId) return
      try {
        await acknowledgeMutation({ workspaceId, alertId, note: input.resolutionNote })
        toast({ title: "Alert acknowledged" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to acknowledge"
        toast({ title: "Acknowledge failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, acknowledgeMutation],
  )

  /** Dev-only util: simulate an alert trigger for testing from the UI. */
  const triggerAlert = useCallback(
    async (thresholdId: Id<"kpiThresholds">, actualValue: number, branchId?: string) => {
      if (!workspaceId) return
      try {
        await triggerMutation({ workspaceId, thresholdId, actualValue, branchId })
        toast({ title: "Alert triggered", description: "Simulated for testing." })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to trigger alert"
        toast({ title: "Trigger failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, triggerMutation],
  )

  return {
    thresholds,
    alerts,
    summary,
    isLoading,
    defineThreshold,
    toggleThreshold,
    acknowledgeAlert,
    triggerAlert,
  }
}

export type { KpiAlert, KpiSummary, KpiThreshold }
