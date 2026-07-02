"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { cn } from "@/lib/utils"
import {
  captureSnapshotSchema,
  type CaptureSnapshotInput,
  DEFAULT_WEIGHTS,
  SCORE_CATEGORIES,
  SCORE_CATEGORY_LABELS,
} from "../types"

interface CaptureSnapshotDialogProps {
  trigger?: React.ReactNode
  defaultBranchId?: string
  onCapture: (input: CaptureSnapshotInput) => Promise<unknown>
}

function todayPeriod(): string {
  // YYYY-MM (monthly snapshot is the common default)
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

const CATEGORY_TO_SCORE_FIELD = {
  revenue: "revenueScore",
  expense: "expenseScore",
  ops: "opsScore",
  staff: "staffScore",
  customer: "customerScore",
} as const

export function CaptureSnapshotDialog({
  trigger,
  defaultBranchId,
  onCapture,
}: CaptureSnapshotDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CaptureSnapshotInput>({
    resolver: zodResolver(captureSnapshotSchema),
    defaultValues: {
      branchId: defaultBranchId ?? "",
      period: todayPeriod(),
      revenueScore: 70,
      expenseScore: 70,
      opsScore: 70,
      staffScore: 70,
      customerScore: 70,
      weights: { ...DEFAULT_WEIGHTS },
      insights: "",
      insightsModel: "",
    },
  })

  const weights = watch("weights")
  const weightsSum =
    Number(weights?.revenue ?? 0) +
    Number(weights?.expense ?? 0) +
    Number(weights?.ops ?? 0) +
    Number(weights?.staff ?? 0) +
    Number(weights?.customer ?? 0)
  const weightsOk = Math.abs(weightsSum - 1) <= 0.01

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onCapture(values)
      reset()
      setOpen(false)
    } catch {
      /* toast handled in hook */
    }
  })

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Capture snapshot
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="lg">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Capture branch health snapshot</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Record a full health snapshot for one branch. The composite score is computed server-side from the five category scores and their weights.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="branchId">Branch ID</Label>
                <Input
                  id="branchId"
                  placeholder="e.g., main, jakarta-01"
                  {...register("branchId")}
                  className={cn(errors.branchId && "border-destructive")}
                />
                {errors.branchId ? (
                  <p className="text-xs text-destructive">{errors.branchId.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="period">Period</Label>
                <Input
                  id="period"
                  placeholder="YYYY-MM or YYYY-MM-DD"
                  {...register("period")}
                  className={cn(errors.period && "border-destructive")}
                />
                {errors.period ? (
                  <p className="text-xs text-destructive">{errors.period.message}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-3 rounded-md border bg-muted/30 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Category scores (0–100)
              </p>
              {SCORE_CATEGORIES.map((cat) => {
                const field = CATEGORY_TO_SCORE_FIELD[cat]
                const value = watch(field)
                const err = errors[field]
                return (
                  <div key={cat} className="grid grid-cols-[120px_1fr_60px] items-center gap-3">
                    <Label htmlFor={field} className="text-sm">
                      {SCORE_CATEGORY_LABELS[cat]}
                    </Label>
                    <Input
                      id={field}
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      {...register(field)}
                    />
                    <span className="text-right font-mono text-sm tabular-nums">
                      {typeof value === "number" ? value.toFixed(0) : value ?? "0"}
                    </span>
                    {err ? (
                      <p className="col-span-3 text-xs text-destructive">{err.message}</p>
                    ) : null}
                  </div>
                )
              })}
            </div>

            <div className="space-y-3 rounded-md border bg-muted/30 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Weights (must sum to 1.0)
                </p>
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums",
                    weightsOk ? "text-emerald-600" : "text-destructive",
                  )}
                >
                  Σ = {weightsSum.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {SCORE_CATEGORIES.map((cat) => (
                  <div key={cat} className="grid gap-1">
                    <Label htmlFor={`weights.${cat}`} className="text-[11px]">
                      {SCORE_CATEGORY_LABELS[cat]}
                    </Label>
                    <Input
                      id={`weights.${cat}`}
                      type="number"
                      step="0.05"
                      min={0}
                      max={1}
                      {...register(`weights.${cat}` as const)}
                    />
                  </div>
                ))}
              </div>
              {errors.weights ? (
                <p className="text-xs text-destructive">
                  {/* superRefine attaches to path ["weights"]; extract message */}
                  {(errors.weights as { message?: string }).message ?? "Invalid weights"}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="insights">Insights (optional)</Label>
              <Textarea
                id="insights"
                rows={3}
                placeholder="Narrative summary of what the scores tell you about this branch this period."
                {...register("insights")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="insightsModel">Insights model (optional)</Label>
              <Input
                id="insightsModel"
                placeholder="e.g., manual, claude-sonnet-4, gpt-4o"
                {...register("insightsModel")}
              />
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !weightsOk}>
              {isSubmitting ? "Capturing…" : "Capture snapshot"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
