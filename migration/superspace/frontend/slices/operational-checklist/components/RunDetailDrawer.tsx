"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle2, FileCheck, Send, X, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import type { Id } from "@convex/_generated/dataModel"
import { RunStateBadge } from "./RunStateBadge"
import { RunItemRow } from "./RunItemRow"
import { availableActions } from "../hooks/useOperationalChecklist"
import {
  countCompleted,
  countCompletedRequired,
  countRequiredItems,
  reviewRunSchema,
  type ChecklistRun,
  type ChecklistTemplate,
  type CheckItemInput,
  type ReviewRunInput,
} from "../types"

type InlineMode = "approve" | "fail" | null

interface Props {
  run: ChecklistRun | null
  template: ChecklistTemplate | null
  onClose: () => void
  onCheckItem: (runId: Id<"checklistRuns">, input: CheckItemInput) => Promise<void> | void
  onComplete: (runId: Id<"checklistRuns">) => Promise<void> | void
  onReview: (runId: Id<"checklistRuns">, input: ReviewRunInput) => Promise<void> | void
}

export function RunDetailDrawer({
  run,
  template,
  onClose,
  onCheckItem,
  onComplete,
  onReview,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<InlineMode>(null)

  const sortedItems = useMemo(
    () => (template ? [...template.items].sort((a, b) => a.order - b.order) : []),
    [template],
  )

  const completionMap = useMemo(() => {
    const m = new Map<string, ChecklistRun["completedItems"][number]>()
    if (run) for (const c of run.completedItems) m.set(c.itemId, c)
    return m
  }, [run])

  if (!run) return null

  const actions = availableActions(run.overallStatus)
  const readOnly =
    run.overallStatus === "approved" || run.overallStatus === "failed"

  const requiredTotal = countRequiredItems(template)
  const requiredDone = countCompletedRequired(template, run)
  const allCompleted = countCompleted(run)
  const requiredRemaining = Math.max(0, requiredTotal - requiredDone)
  const canComplete = requiredTotal === 0 ? allCompleted > 0 : requiredRemaining === 0

  const runCompleteSubmit = async () => {
    setBusy(true)
    try {
      await onComplete(run._id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PanelSection>
      <PanelSection.Header className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Checklist run
          </p>
          <h2 className="truncate text-lg font-semibold">
            {template?.name ?? "Unknown template"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {run.runDate} · {requiredDone} / {requiredTotal} required done
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RunStateBadge status={run.overallStatus} />
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PanelSection.Header>

      <PanelSection.Items className="p-4 text-sm">
        <dl className="grid grid-cols-3 gap-x-4 gap-y-2">
          <dt className="text-muted-foreground">Run date</dt>
          <dd className="col-span-2 font-mono text-xs">{run.runDate}</dd>

          <dt className="text-muted-foreground">Branch</dt>
          <dd className="col-span-2 truncate">{run.branchId ?? "—"}</dd>

          <dt className="text-muted-foreground">Assigned</dt>
          <dd className="col-span-2 truncate font-mono text-xs">
            {run.assignedTo ? String(run.assignedTo) : "—"}
          </dd>

          <dt className="text-muted-foreground">Started</dt>
          <dd className="col-span-2">{formatRelativeTime(run.createdAt)}</dd>

          {run.reviewedAt ? (
            <>
              <dt className="text-muted-foreground">Reviewed</dt>
              <dd className="col-span-2">{formatRelativeTime(run.reviewedAt)}</dd>
            </>
          ) : null}
        </dl>

        {run.reviewNotes ? (
          <>
            <Separator className="my-3" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Review notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{run.reviewNotes}</p>
          </>
        ) : null}

        <Separator className="my-4" />

        {!template ? (
          <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
            Template not found — cannot render items.
          </div>
        ) : (
          <>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Items ({sortedItems.length})
              </p>
              <Badge variant="outline" className="font-mono text-[10px]">
                {allCompleted} / {sortedItems.length} done
              </Badge>
            </div>
            <div className="space-y-2">
              {sortedItems.map((item, idx) => (
                <RunItemRow
                  key={item.id}
                  index={idx}
                  item={item}
                  completion={completionMap.get(item.id)}
                  disabled={readOnly || run.overallStatus === "review"}
                  onPersist={async (input) => {
                    await onCheckItem(run._id, input)
                  }}
                />
              ))}
            </div>
          </>
        )}
      </PanelSection.Items>

      {actions.length > 0 ? (
        <PanelSection.Footer className="p-3">
          {mode === "approve" || mode === "fail" ? (
            <ReviewForm
              approved={mode === "approve"}
              busy={busy}
              onCancel={() => setMode(null)}
              onSubmit={async (input) => {
                setBusy(true)
                try {
                  await onReview(run._id, input)
                  setMode(null)
                } finally {
                  setBusy(false)
                }
              }}
            />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {run.overallStatus === "review"
                  ? "Awaiting reviewer sign-off."
                  : canComplete
                    ? "All required items done — ready to submit."
                    : `${requiredRemaining} required ${requiredRemaining === 1 ? "item" : "items"} left.`}
              </p>
              <div className="flex items-center gap-2">
                {actions.some((a) => a.id === "complete") ? (
                  <Button
                    size="sm"
                    disabled={busy || !canComplete}
                    onClick={runCompleteSubmit}
                    className="gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit for review
                  </Button>
                ) : null}
                {actions.some((a) => a.id === "approve") ? (
                  <Button
                    size="sm"
                    disabled={busy}
                    onClick={() => setMode("approve")}
                    className="gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                ) : null}
                {actions.some((a) => a.id === "fail") ? (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={busy}
                    onClick={() => setMode("fail")}
                    className="gap-1.5"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Fail
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </PanelSection.Footer>
      ) : readOnly ? (
        <PanelSection.Footer className="p-3 text-right text-xs text-muted-foreground">
          <FileCheck className="mr-1 inline h-3.5 w-3.5" />
          Run is read-only.
        </PanelSection.Footer>
      ) : null}
    </PanelSection>
  )
}

// ---------- Inline review form ----------

function ReviewForm({
  approved,
  busy,
  onCancel,
  onSubmit,
}: {
  approved: boolean
  busy: boolean
  onCancel: () => void
  onSubmit: (input: ReviewRunInput) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ReviewRunInput>({
    resolver: zodResolver(reviewRunSchema),
    defaultValues: { approved, reviewNotes: "" },
  })

  return (
    <form
      className="space-y-2"
      onSubmit={handleSubmit((v) => onSubmit({ ...v, approved }))}
    >
      <Label htmlFor="reviewNotes" className="text-xs">
        Review note {approved ? "(optional)" : "(recommended)"}
      </Label>
      <Textarea
        id="reviewNotes"
        rows={2}
        placeholder={
          approved
            ? "Anything worth flagging?"
            : "Why is this run being failed?"
        }
        {...register("reviewNotes")}
        className={cn(errors.reviewNotes && "border-destructive")}
      />
      {errors.reviewNotes ? (
        <p className="text-xs text-destructive">{errors.reviewNotes.message}</p>
      ) : null}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          Back
        </Button>
        <Button aria-label="Check circle"
          type="submit"
          size="sm"
          variant={approved ? "default" : "destructive"}
          disabled={busy}
          className="gap-1.5"
        >
          {approved ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Confirm approve
            </>
          ) : (
            <>
              <XCircle className="h-3.5 w-3.5" />
              Confirm fail
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
