"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { DateField } from "@/frontend/shared/foundation/utils/datepicker"
import { cn } from "@/lib/utils"
import {
  TASK_TYPES,
  TASK_TYPE_LABELS,
  FREQUENCIES,
  FREQUENCY_LABELS,
  scheduleTaskSchema,
  type ScheduleTaskInput,
  type TaskType,
  type Frequency,
} from "../types"

interface TaskCreateDialogProps {
  trigger?: React.ReactNode
  onCreate: (input: ScheduleTaskInput) => Promise<unknown>
}

export function TaskCreateDialog({ trigger, onCreate }: TaskCreateDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleTaskInput>({
    resolver: zodResolver(scheduleTaskSchema),
    defaultValues: {
      type: "preventive",
      frequency: "monthly",
      nextDueAt: new Date().toISOString().slice(0, 10),
    },
  })

  const type = watch("type")
  const frequency = watch("frequency")

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onCreate(values)
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
          <Calendar className="h-4 w-4" />
          Schedule task
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Schedule maintenance task</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Define a preventive, reactive, or inspection task. Recurring frequencies
            auto-reschedule the next instance on completion.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Replace AC filters"
                {...register("title")}
                className={cn(errors.title && "border-destructive")}
              />
              {errors.title ? (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={type}
                  onValueChange={(v) => setValue("type", v as TaskType)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {TASK_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={frequency}
                  onValueChange={(v) => setValue("frequency", v as Frequency)}
                >
                  <SelectTrigger id="frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {FREQUENCY_LABELS[f]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="nextDueAt">Next due</Label>
                <DateField
                  name="nextDueAt"
                  control={control}
                  placeholder="Pick a date"
                  className={cn(errors.nextDueAt && "border-destructive")}
                />
                {errors.nextDueAt ? (
                  <p className="text-xs text-destructive">{errors.nextDueAt.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="estimatedCost">Estimated cost</Label>
                <Input
                  id="estimatedCost"
                  type="number"
                  step="1"
                  min={0}
                  {...register("estimatedCost")}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="assignedTo">Assigned to</Label>
                <Input
                  id="assignedTo"
                  placeholder="users/..."
                  {...register("assignedTo")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branchId">Branch (optional)</Label>
                <Input id="branchId" {...register("branchId")} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assetId">Asset ID (optional)</Label>
              <Input
                id="assetId"
                placeholder="assets/..."
                {...register("assetId")}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={2} {...register("description")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={2} {...register("notes")} />
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling…" : "Schedule task"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
