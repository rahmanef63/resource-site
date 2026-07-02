"use client"

import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import type { ChecklistTemplate, StartRunInput } from "../types"
import { SCOPE_LABELS, startRunSchema } from "../types"

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

interface StartRunDialogProps {
  trigger?: React.ReactNode
  templates: ChecklistTemplate[]
  /** Open the dialog pre-filled for a specific template. */
  defaultTemplateId?: string
  /** Control mode — if provided, parent owns open/onOpenChange. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onStart: (input: StartRunInput) => Promise<unknown>
}

export function StartRunDialog({
  trigger,
  templates,
  defaultTemplateId,
  open: openProp,
  onOpenChange,
  onStart,
}: StartRunDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = openProp !== undefined
  const open = isControlled ? !!openProp : internalOpen
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v)
    if (!isControlled) setInternalOpen(v)
  }

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StartRunInput>({
    resolver: zodResolver(startRunSchema),
    defaultValues: {
      templateId: defaultTemplateId ?? "",
      runDate: todayISO(),
      branchId: "",
      assignedTo: "",
    },
  })

  // Reset defaults whenever the dialog opens (picks up new defaultTemplateId).
  useEffect(() => {
    if (open) {
      reset({
        templateId: defaultTemplateId ?? "",
        runDate: todayISO(),
        branchId: "",
        assignedTo: "",
      })
    }
  }, [open, defaultTemplateId, reset])

  const activeTemplates = templates.filter((t) => t.isActive)

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onStart({
        ...values,
        branchId: values.branchId?.trim() ? values.branchId : undefined,
        assignedTo: values.assignedTo?.trim() ? values.assignedTo : undefined,
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
      ) : !isControlled ? (
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setOpen(true)}>
          <Play className="h-3.5 w-3.5" />
          Start run
        </Button>
      ) : null}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Start checklist run</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Pick a template and run date. The run will start in pending state.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="templateId">Template</Label>
              <Controller
                control={control}
                name="templateId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="templateId"
                      className={cn(errors.templateId && "border-destructive")}
                    >
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTemplates.length === 0 ? (
                        <SelectItem value="__none__" disabled>
                          No active templates
                        </SelectItem>
                      ) : (
                        activeTemplates.map((t) => (
                          <SelectItem key={String(t._id)} value={String(t._id)}>
                            {t.name} · {SCOPE_LABELS[t.scope]}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.templateId ? (
                <p className="text-xs text-destructive">{errors.templateId.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="runDate">Run date</Label>
                <DateField
                  name="runDate"
                  control={control}
                  placeholder="Pick a date"
                  className={cn(errors.runDate && "border-destructive")}
                />
                {errors.runDate ? (
                  <p className="text-xs text-destructive">{errors.runDate.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branchId">Branch (optional)</Label>
                <Input id="branchId" placeholder="jakarta-01" {...register("branchId")} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assigned to (user id, optional)</Label>
              <Input
                id="assignedTo"
                placeholder="users/..."
                {...register("assignedTo")}
              />
              <p className="text-[11px] text-muted-foreground">
                Leave empty to assign yourself.
              </p>
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Starting…" : "Start run"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
