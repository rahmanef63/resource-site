"use client"

import { useCallback, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "@/hooks/use-toast"
import type { BranchHealthSnapshot, CaptureSnapshotInput } from "../types"

/**
 * Branch Health Scoring hook.
 *
 * Surfaces the write-only snapshot model backing the
 * `branchHealthSnapshots` Convex domain. Snapshots are complete on capture
 * (no mid-state workflow), so the returned API is limited to listing,
 * fetching the latest-per-branch summary, and capturing new snapshots.
 */
export function useBranchHealth(
  workspaceId: Id<"workspaces"> | null | undefined,
  branchId?: string,
) {
  const listQuery = useQuery(
    api.features.branchHealthScoring.queries.listSnapshots,
    workspaceId ? { workspaceId, branchId } : "skip",
  )

  const latestPerBranchQuery = useQuery(
    api.features.branchHealthScoring.queries.getLatestPerBranch,
    workspaceId ? { workspaceId } : "skip",
  )

  const captureMutation = useMutation(
    api.features.branchHealthScoring.mutations.captureSnapshot,
  )

  const items = useMemo<BranchHealthSnapshot[]>(
    () => ((listQuery ?? []) as BranchHealthSnapshot[]),
    [listQuery],
  )

  const latestPerBranch = useMemo<BranchHealthSnapshot[]>(
    () => ((latestPerBranchQuery ?? []) as BranchHealthSnapshot[]),
    [latestPerBranchQuery],
  )

  const isLoading = workspaceId ? listQuery === undefined : false

  const captureSnapshot = useCallback(
    async (input: CaptureSnapshotInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const result = await captureMutation({
          workspaceId,
          branchId: input.branchId,
          period: input.period,
          revenueScore: input.revenueScore,
          expenseScore: input.expenseScore,
          opsScore: input.opsScore,
          staffScore: input.staffScore,
          customerScore: input.customerScore,
          weights: input.weights,
          insights: input.insights,
          insightsModel: input.insightsModel,
        })
        toast({
          title: "Snapshot captured",
          description: `Composite score: ${result?.compositeScore?.toFixed(1) ?? "—"}`,
        })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to capture snapshot"
        toast({ title: "Capture failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, captureMutation],
  )

  return {
    items,
    latestPerBranch,
    isLoading,
    captureSnapshot,
  }
}

export type { BranchHealthSnapshot, CaptureSnapshotInput }
