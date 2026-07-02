"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { cn } from "@/lib/utils"
import {
  ACTION_POLICIES,
  ACTION_POLICY_LABELS,
  DIRECTIONS,
  DIRECTION_LABELS,
  SEVERITIES,
  SEVERITY_LABELS,
  defineThresholdSchema,
  type ActionPolicy,
  type DefineThresholdInput,
  type Direction,
  type Severity,
} from "../types"

interface ThresholdCreateDialogProps {
  trigger?: React.ReactNode
  onCreate: (input: DefineThresholdInput) => Promise<unknown>
}

export function ThresholdCreateDialog({ trigger, onCreate }: ThresholdCreateDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DefineThresholdInput>({
    resolver: zodResolver(defineThresholdSchema),
    defaultValues: {
      kpiKey: "",
      metric: "",
      direction: "above",
      value1: 0,
      value2: undefined,
      severity: "warning",
      actionPolicy: ["notify"],
      branchId: "",
    },
  })

  const direction = watch("direction")
  const isRange = direction === "outside-range" || direction === "inside-range"

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onCreate({
        ...values,
        branchId: values.branchId?.trim() ? values.branchId : undefined,
      })
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
          New threshold
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>New KPI threshold</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Define the condition that fires an alert. Thresholds are active by default.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="kpiKey">KPI key</Label>
                <Input
                  id="kpiKey"
                  placeholder="daily_sales"
                  {...register("kpiKey")}
                  className={cn(errors.kpiKey && "border-destructive")}
                />
                {errors.kpiKey ? (
                  <p className="text-xs text-destructive">{errors.kpiKey.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metric">Metric label</Label>
                <Input
                  id="metric"
                  placeholder="Daily sales (IDR)"
                  {...register("metric")}
                  className={cn(errors.metric && "border-destructive")}
                />
                {errors.metric ? (
                  <p className="text-xs text-destructive">{errors.metric.message}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="direction">Direction</Label>
              <Select
                value={direction}
                onValueChange={(v) => setValue("direction", v as Direction)}
              >
                <SelectTrigger id="direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIRECTIONS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {DIRECTION_LABELS[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="value1">{isRange ? "Lower bound" : "Value"}</Label>
                <Input
                  id="value1"
                  type="number"
                  step="any"
                  {...register("value1")}
                  className={cn(errors.value1 && "border-destructive")}
                />
                {errors.value1 ? (
                  <p className="text-xs text-destructive">{errors.value1.message}</p>
                ) : null}
              </div>
              {isRange ? (
                <div className="grid gap-2">
                  <Label htmlFor="value2">Upper bound</Label>
                  <Input
                    id="value2"
                    type="number"
                    step="any"
                    {...register("value2")}
                    className={cn(errors.value2 && "border-destructive")}
                  />
                  {errors.value2 ? (
                    <p className="text-xs text-destructive">{errors.value2.message}</p>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-2">
                  <Label htmlFor="branchId">Branch (optional)</Label>
                  <Input id="branchId" placeholder="jakarta-01" {...register("branchId")} />
                </div>
              )}
            </div>

            {isRange ? (
              <div className="grid gap-2">
                <Label htmlFor="branchId">Branch (optional)</Label>
                <Input id="branchId" placeholder="jakarta-01" {...register("branchId")} />
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label htmlFor="severity">Severity</Label>
              <Controller
                control={control}
                name="severity"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v as Severity)}>
                    <SelectTrigger id="severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITIES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {SEVERITY_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid gap-2">
              <Label>Action policy</Label>
              <Controller
                control={control}
                name="actionPolicy"
                render={({ field }) => {
                  const selected = new Set<ActionPolicy>(field.value ?? [])
                  const toggle = (p: ActionPolicy, checked: boolean) => {
                    const next = new Set(selected)
                    if (checked) next.add(p)
                    else next.delete(p)
                    field.onChange(Array.from(next))
                  }
                  return (
                    <div className="flex flex-col gap-2 rounded-md border p-3">
                      {ACTION_POLICIES.map((p) => (
                        <label key={p} className="flex cursor-pointer items-center gap-2 text-sm">
                          <Checkbox
                            checked={selected.has(p)}
                            onCheckedChange={(v) => toggle(p, Boolean(v))}
                          />
                          <span>{ACTION_POLICY_LABELS[p]}</span>
                        </label>
                      ))}
                    </div>
                  )
                }}
              />
              {errors.actionPolicy ? (
                <p className="text-xs text-destructive">
                  {(errors.actionPolicy as { message?: string })?.message ??
                    "Pick at least one action policy"}
                </p>
              ) : null}
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Define threshold"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
