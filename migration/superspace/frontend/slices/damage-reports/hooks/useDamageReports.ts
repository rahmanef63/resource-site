"use client"

import { useCallback, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "@/hooks/use-toast"
import type {
  CreateReportInput,
  DamageReport,
  DamageReportSummary,
  ReportStatus,
  Resolution,
} from "../types"

/**
 * Damage Reports hook.
 *
 * Surfaces the five-state workflow (reported → triaged → investigating →
 * resolved | written-off) against the `damageReports` Convex domain, including
 * severity tracking and resolution logging (cost / insurance claim).
 */
export function useDamageReports(workspaceId: Id<"workspaces"> | null | undefined) {
  const listQuery = useQuery(
    api.features.damageReports.queries.listReports,
    workspaceId ? { workspaceId } : "skip",
  )

  const summaryQuery = useQuery(
    api.features.damageReports.queries.getSummary,
    workspaceId ? { workspaceId } : "skip",
  )

  const createMutation = useMutation(api.features.damageReports.mutations.createReport)
  const triageMutation = useMutation(api.features.damageReports.mutations.triageReport)
  const resolveMutation = useMutation(api.features.damageReports.mutations.resolveReport)

  const items = useMemo<DamageReport[]>(
    () => ((listQuery ?? []) as DamageReport[]),
    [listQuery],
  )
  const summary = summaryQuery as DamageReportSummary | undefined

  const isLoading = workspaceId ? listQuery === undefined : false

  const createReport = useCallback(
    async (input: CreateReportInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const result = await createMutation({
          workspaceId,
          category: input.category,
          severity: input.severity,
          title: input.title,
          description: input.description,
          location: input.location,
          costEstimate: input.costEstimate,
          photos: input.photos,
          branchId: input.branchId,
          relatedEntityType: input.relatedEntityType,
          relatedEntityId: input.relatedEntityId,
        })
        toast({ title: "Damage reported", description: "Awaiting triage." })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to file report"
        toast({ title: "Report failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, createMutation],
  )

  const triageReport = useCallback(
    async (reportId: Id<"damageReports">, assignedTo: Id<"users">) => {
      if (!workspaceId) return
      try {
        await triageMutation({ workspaceId, reportId, assignedTo })
        toast({ title: "Report triaged", description: "Assigned for investigation." })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to triage"
        toast({ title: "Triage failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, triageMutation],
  )

  const resolveReport = useCallback(
    async (
      reportId: Id<"damageReports">,
      input: {
        resolution: Resolution
        actualCost?: number
        insuranceClaimRef?: string
        notes?: string
      },
    ) => {
      if (!workspaceId) return
      try {
        await resolveMutation({
          workspaceId,
          reportId,
          resolution: input.resolution,
          actualCost: input.actualCost,
          insuranceClaimRef: input.insuranceClaimRef,
          notes: input.notes,
        })
        toast({ title: "Report resolved" })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to resolve"
        toast({ title: "Resolve failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, resolveMutation],
  )

  return {
    items,
    summary,
    isLoading,
    createReport,
    triageReport,
    resolveReport,
  }
}

/**
 * Legal state transitions for a damage report. Consumed by the detail drawer
 * to show only the buttons the current status permits.
 */
export function availableActions(
  status: ReportStatus,
): Array<{ id: "triage" | "resolve"; label: string }> {
  switch (status) {
    case "reported":
      return [{ id: "triage", label: "Triage" }]
    case "triaged":
    case "investigating":
      return [{ id: "resolve", label: "Resolve" }]
    default:
      return []
  }
}

export type { DamageReport, DamageReportSummary, ReportStatus }
