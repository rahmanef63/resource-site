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
import { createRequestSchema, type CreateRequestInput } from "../types"

interface RequestCreateDialogProps {
  trigger?: React.ReactNode
  defaultRequesterId?: string
  onCreate: (input: CreateRequestInput) => Promise<unknown>
}

export function RequestCreateDialog({
  trigger,
  defaultRequesterId,
  onCreate,
}: RequestCreateDialogProps) {
  const [open, setOpen] = useState(false)
  const [attachmentsRaw, setAttachmentsRaw] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      currency: "IDR",
      requesterId: defaultRequesterId ?? "",
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    const attachments = attachmentsRaw
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    try {
      await onCreate({ ...values, attachments: attachments.length ? attachments : undefined })
      reset()
      setAttachmentsRaw("")
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
          New request
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>New petty cash request</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Log a cash-on-hand need. Request lands in &quot;pending&quot; and awaits approval.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                placeholder="e.g., Office supplies for front desk"
                {...register("purpose")}
                className={cn(errors.purpose && "border-destructive")}
              />
              {errors.purpose ? (
                <p className="text-xs text-destructive">{errors.purpose.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="1"
                  min={1}
                  {...register("amount")}
                  className={cn(errors.amount && "border-destructive")}
                />
                {errors.amount ? (
                  <p className="text-xs text-destructive">{errors.amount.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" {...register("currency")} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="requesterId">Requester user ID</Label>
              <Input
                id="requesterId"
                placeholder="users/..."
                {...register("requesterId")}
                className={cn(errors.requesterId && "border-destructive")}
              />
              {errors.requesterId ? (
                <p className="text-xs text-destructive">{errors.requesterId.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input id="category" placeholder="Supplies, Travel, Meals" {...register("category")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branchId">Branch (optional)</Label>
                <Input id="branchId" {...register("branchId")} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="attachments">Attachment URLs (one per line)</Label>
              <Textarea
                id="attachments"
                rows={2}
                placeholder="https://..."
                value={attachmentsRaw}
                onChange={(e) => setAttachmentsRaw(e.target.value)}
              />
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create request"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
