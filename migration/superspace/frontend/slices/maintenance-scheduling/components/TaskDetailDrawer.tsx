"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CheckCircle, SkipForward, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import type { Id } from "@convex/_generated/dataModel"
import { TaskStateBadge } from "./TaskStateBadge"
import { availableActions, isOverdue } from "../hooks/useMaintenance"
import {
  completeTaskSchema,
  skipTaskSchema,
  TASK_TYPE_LABELS,
  FREQUENCY_LABELS,
  type CompleteTaskInput,
  type MaintenanceTask,
  type SkipTaskInput,
} from "../types"
import { formatCurrency, formatDate } from "../lib/format"

interface Props {
  task: MaintenanceTask | null
  onClose: () => void
  onComplete: (id: Id<"maintenanceTasks">, input?: CompleteTaskInput) => Promise<void> | void
  onSkip: (id: Id<"maintenanceTasks">, input: SkipTaskInput) => Promise<void> | void
}

type PanelMode = "none" | "complete" | "skip"

export function TaskDetailDrawer({ task, onClose, onComplete, onSkip }: Props) {
  const [mode, setMode] = useState<PanelMode>("none")
  const [busy, setBusy] = useState(false)

  const completeForm = useForm<CompleteTaskInput>({
    resolver: zodResolver(completeTaskSchema),
    defaultValues: { actualCost: undefined, notes: "" },
  })

  const skipForm = useForm<SkipTaskInput>({
    resolver: zodResolver(skipTaskSchema),
    defaultValues: { reason: "" },
  })

  if (!task) return null

  const overdue = isOverdue(task)
  const displayStatus = overdue && task.status === "scheduled" ? "overdue" : task.status
  const actions = availableActions(task.status)

  const submitComplete = completeForm.handleSubmit(async (values) => {
    setBusy(true)
    try {
      await onComplete(task._id, values)
      completeForm.reset()
      setMode("none")
    } finally {
      setBusy(false)
    }
  })

  const submitSkip = skipForm.handleSubmit(async (values) => {
    setBusy(true)
    try {
      await onSkip(task._id, values)
      skipForm.reset()
      setMode("none")
    } finally {
      setBusy(false)
    }
  })

  return (
    <PanelSection label="Maintenance task">
      <PanelSection.Header className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Maintenance task</p>
          <h2 className="truncate text-lg font-semibold">{task.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {TASK_TYPE_LABELS[task.type]} · {FREQUENCY_LABELS[task.frequency]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TaskStateBadge status={displayStatus} />
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PanelSection.Header>

      <PanelSection.Items className="p-4 text-sm">
        <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
          <dt className="text-muted-foreground">Next due</dt>
          <dd className="col-span-2">
            <div className="flex items-center gap-2">
              <span>{formatDate(task.nextDueAt)}</span>
              {overdue ? (
                <span className="flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="h-3 w-3" /> overdue
                </span>
              ) : null}
            </div>
          </dd>

          <dt className="text-muted-foreground">Assigned</dt>
          <dd className="col-span-2 truncate">{task.assignedTo ?? "—"}</dd>

          <dt className="text-muted-foreground">Branch</dt>
          <dd className="col-span-2 truncate">{task.branchId ?? "—"}</dd>

          <dt className="text-muted-foreground">Asset</dt>
          <dd className="col-span-2 truncate">{task.assetId ?? "—"}</dd>

          <dt className="text-muted-foreground">Estimated</dt>
          <dd className="col-span-2">
            {task.estimatedCost != null ? formatCurrency(task.estimatedCost) : "—"}
          </dd>

          {task.actualCost != null ? (
            <>
              <dt className="text-muted-foreground">Actual</dt>
              <dd className="col-span-2">{formatCurrency(task.actualCost)}</dd>
            </>
          ) : null}

          {task.lastDoneAt ? (
            <>
              <dt className="text-muted-foreground">Last done</dt>
              <dd className="col-span-2">{formatRelativeTime(task.lastDoneAt)}</dd>
            </>
          ) : null}

          {task.completedAt ? (
            <>
              <dt className="text-muted-foreground">Completed</dt>
              <dd className="col-span-2">{formatRelativeTime(task.completedAt)}</dd>
            </>
          ) : null}

          <dt className="text-muted-foreground">Created</dt>
          <dd className="col-span-2">{formatRelativeTime(task.createdAt)}</dd>
        </dl>

        {task.description ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Description</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{task.description}</p>
          </>
        ) : null}

        {task.notes ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{task.notes}</p>
          </>
        ) : null}

        {mode === "complete" ? (
          <>
            <Separator className="my-4" />
            <form onSubmit={submitComplete} className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Complete task
              </p>
              <div className="grid gap-2">
                <Label htmlFor="actualCost">Actual cost</Label>
                <Input
                  id="actualCost"
                  type="number"
                  step="1"
                  min={0}
                  {...completeForm.register("actualCost")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="complete-notes">Completion notes</Label>
                <Textarea
                  id="complete-notes"
                  rows={3}
                  {...completeForm.register("notes")}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setMode("none")}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Confirm complete
                </Button>
              </div>
            </form>
          </>
        ) : null}

        {mode === "skip" ? (
          <>
            <Separator className="my-4" />
            <form onSubmit={submitSkip} className="space-y-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Skip task</p>
              <div className="grid gap-2">
                <Label htmlFor="skip-reason">Reason</Label>
                <Textarea
                  id="skip-reason"
                  rows={3}
                  placeholder="Why is this task being skipped?"
                  {...skipForm.register("reason")}
                />
                {skipForm.formState.errors.reason ? (
                  <p className="text-xs text-destructive">
                    {skipForm.formState.errors.reason.message}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setMode("none")}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="destructive" disabled={busy} className="gap-1.5">
                  <SkipForward className="h-3.5 w-3.5" />
                  Confirm skip
                </Button>
              </div>
            </form>
          </>
        ) : null}
      </PanelSection.Items>

      {actions.length > 0 && mode === "none" ? (
        <PanelSection.Footer className="p-3">
          <div className="flex items-center justify-end gap-2">
            {actions.map((a) => (
              <Button
                key={a.id}
                size="sm"
                variant={a.id === "skip" ? "outline" : "default"}
                onClick={() => setMode(a.id)}
                className="gap-1.5"
              >
                {a.id === "complete" ? (
                  <CheckCircle className="h-3.5 w-3.5" />
                ) : (
                  <SkipForward className="h-3.5 w-3.5" />
                )}
                {a.label}
              </Button>
            ))}
          </div>
        </PanelSection.Footer>
      ) : null}
    </PanelSection>
  )
}
