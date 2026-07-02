"use client"

import { useCallback, useMemo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/frontend/shared/foundation/utils/convex/any-api"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "@/hooks/use-toast"
import type {
  ChecklistItem,
  ChecklistRun,
  ChecklistTemplate,
  CheckItemInput,
  CreateTemplateInput,
  ReviewRunInput,
  RunStatus,
  StartRunInput,
} from "../types"

/**
 * Operational Checklist hook.
 *
 * Surfaces the two-entity workflow (templates + runs) against the
 * `checklistTemplates` + `checklistRuns` Convex domain, with per-item
 * completion (photo + notes) and review approval.
 */
export function useOperationalChecklist(
  workspaceId: Id<"workspaces"> | null | undefined,
) {
  const templatesQuery = useQuery(
    api.features.operationalChecklist.queries.listTemplates,
    workspaceId ? { workspaceId } : "skip",
  )

  const runsQuery = useQuery(
    api.features.operationalChecklist.queries.listRuns,
    workspaceId ? { workspaceId } : "skip",
  )

  const createTemplateMutation = useMutation(
    api.features.operationalChecklist.mutations.createTemplate,
  )
  const startRunMutation = useMutation(
    api.features.operationalChecklist.mutations.startRun,
  )
  const checkItemMutation = useMutation(
    api.features.operationalChecklist.mutations.checkItem,
  )
  const completeRunMutation = useMutation(
    api.features.operationalChecklist.mutations.completeRun,
  )
  const reviewRunMutation = useMutation(
    api.features.operationalChecklist.mutations.reviewRun,
  )

  const templates = useMemo<ChecklistTemplate[]>(
    () => ((templatesQuery ?? []) as ChecklistTemplate[]),
    [templatesQuery],
  )
  const runs = useMemo<ChecklistRun[]>(
    () => ((runsQuery ?? []) as ChecklistRun[]),
    [runsQuery],
  )

  const isLoading = workspaceId
    ? templatesQuery === undefined || runsQuery === undefined
    : false

  // -- mutations --

  const createTemplate = useCallback(
    async (input: CreateTemplateInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const items: ChecklistItem[] = input.items.map((row, idx) => ({
          id:
            typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
              ? crypto.randomUUID()
              : `itm_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 8)}`,
          label: row.label,
          order: idx,
          required: row.required,
          photoRequired: row.photoRequired || undefined,
          notesRequired: row.notesRequired || undefined,
        }))
        const result = await createTemplateMutation({
          workspaceId,
          branchId: input.branchId?.trim() ? input.branchId : undefined,
          name: input.name,
          description: input.description?.trim() ? input.description : undefined,
          scope: input.scope,
          items,
        })
        toast({
          title: "Template created",
          description: `${input.name} is ready to run.`,
        })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create template"
        toast({ title: "Create failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, createTemplateMutation],
  )

  const startRun = useCallback(
    async (input: StartRunInput) => {
      if (!workspaceId) throw new Error("No workspace selected")
      try {
        const result = await startRunMutation({
          workspaceId,
          templateId: input.templateId as Id<"checklistTemplates">,
          runDate: input.runDate,
          branchId: input.branchId?.trim() ? input.branchId : undefined,
          assignedTo: input.assignedTo?.trim()
            ? (input.assignedTo as Id<"users">)
            : undefined,
        })
        toast({ title: "Run started", description: `For ${input.runDate}.` })
        return result
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to start run"
        toast({ title: "Start failed", description: msg, variant: "destructive" })
        throw e
      }
    },
    [workspaceId, startRunMutation],
  )

  const checkItem = useCallback(
    async (runId: Id<"checklistRuns">, input: CheckItemInput) => {
      if (!workspaceId) return
      try {
        await checkItemMutation({
          workspaceId,
          runId,
          itemId: input.itemId,
          completed: input.completed,
          photoUrl: input.photoUrl?.trim() ? input.photoUrl : undefined,
          notes: input.notes?.trim() ? input.notes : undefined,
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to update item"
        toast({ title: "Update failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, checkItemMutation],
  )

  const completeRun = useCallback(
    async (runId: Id<"checklistRuns">) => {
      if (!workspaceId) return
      try {
        await completeRunMutation({ workspaceId, runId })
        toast({ title: "Run completed", description: "Ready for review." })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to complete run"
        toast({ title: "Complete failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, completeRunMutation],
  )

  const reviewRun = useCallback(
    async (runId: Id<"checklistRuns">, input: ReviewRunInput) => {
      if (!workspaceId) return
      try {
        await reviewRunMutation({
          workspaceId,
          runId,
          approved: input.approved,
          reviewNotes: input.reviewNotes?.trim() ? input.reviewNotes : undefined,
        })
        toast({
          title: input.approved ? "Run approved" : "Run failed",
          description: input.approved
            ? "Checklist signed off."
            : "Checklist flagged as failed.",
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to review run"
        toast({ title: "Review failed", description: msg, variant: "destructive" })
      }
    },
    [workspaceId, reviewRunMutation],
  )

  return {
    templates,
    runs,
    isLoading,
    createTemplate,
    startRun,
    checkItem,
    completeRun,
    reviewRun,
  }
}

export type RunAction = "complete" | "approve" | "fail"

/**
 * Legal transitions for a run's overallStatus, used by the run detail drawer
 * to show the correct bottom-bar buttons.
 */
export function availableActions(
  status: RunStatus,
): Array<{ id: RunAction; label: string }> {
  switch (status) {
    case "pending":
    case "in_progress":
    case "completed":
      return [{ id: "complete", label: "Submit for review" }]
    case "review":
      return [
        { id: "approve", label: "Approve" },
        { id: "fail", label: "Fail" },
      ]
    default:
      return []
  }
}

export type { ChecklistRun, ChecklistTemplate, ChecklistItem, RunStatus }
