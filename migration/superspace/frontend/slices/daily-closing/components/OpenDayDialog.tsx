"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlayCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ResponsiveDialog } from "@/frontend/shared/ui/components/ResponsiveDialog"
import { DateField } from "@/frontend/shared/foundation/utils/datepicker"
import { cn } from "@/lib/utils"
import { openDaySchema, type OpenDayInput } from "../types"

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

interface OpenDayDialogProps {
  trigger?: React.ReactNode
  defaultBranchId?: string
  onOpen: (input: OpenDayInput) => Promise<unknown>
}

export function OpenDayDialog({ trigger, defaultBranchId, onOpen }: OpenDayDialogProps) {
  const [open, setOpen] = useState(false)
  const today = todayISO()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OpenDayInput>({
    resolver: zodResolver(openDaySchema),
    defaultValues: { businessDate: today, branchId: defaultBranchId ?? "" },
  })

  // Reset form each time the dialog opens so the default date stays fresh.
  useEffect(() => {
    if (open) {
      reset({ businessDate: todayISO(), branchId: defaultBranchId ?? "" })
    }
  }, [open, defaultBranchId, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await onOpen({
        businessDate: values.businessDate,
        branchId: values.branchId?.trim() ? values.branchId.trim() : undefined,
      })
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
          <PlayCircle className="h-4 w-4" />
          Open today&apos;s close
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="sm">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>Open daily closing</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Start the end-of-day workflow. The closing begins in &quot;open&quot; status.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="businessDate">Business date</Label>
              <DateField
                name="businessDate"
                control={control}
                placeholder="Pick a date"
                className={cn(errors.businessDate && "border-destructive")}
              />
              {errors.businessDate ? (
                <p className="text-xs text-destructive">{errors.businessDate.message}</p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="branchId">Branch (optional)</Label>
              <Input
                id="branchId"
                placeholder="branch-slug or blank"
                {...register("branchId")}
              />
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting} className="gap-1.5">
              <PlayCircle className="h-4 w-4" />
              {isSubmitting ? "Opening…" : "Open day"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
