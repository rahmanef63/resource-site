"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus } from "lucide-react"
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
  TRANSFER_TYPES,
  TRANSFER_TYPE_LABELS,
  createTransferSchema,
  type CreateTransferInput,
  type TransferType,
} from "../types"

interface TransferCreateDialogProps {
  trigger?: React.ReactNode
  defaultOwnerUserId?: string
  onCreate: (input: CreateTransferInput) => Promise<unknown>
}

export function TransferCreateDialog({
  trigger,
  defaultOwnerUserId,
  onCreate,
}: TransferCreateDialogProps) {
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransferInput>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: {
      type: "withdraw",
      currency: "IDR",
      transferDate: new Date().toISOString().slice(0, 10),
      ownerUserId: defaultOwnerUserId ?? "",
    },
  })

  const type = watch("type")

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
          <Plus className="h-4 w-4" />
          New transfer
        </Button>
      )}

      <ResponsiveDialog open={open} onOpenChange={setOpen} variant="modal" size="md">
        <ResponsiveDialog.Header>
          <ResponsiveDialog.Title>New owner transfer</ResponsiveDialog.Title>
          <ResponsiveDialog.Description>
            Record a capital movement. Request lands in &quot;pending&quot; and awaits approval.
          </ResponsiveDialog.Description>
        </ResponsiveDialog.Header>

        <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialog.Body className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setValue("type", v as TransferType)}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSFER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TRANSFER_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label htmlFor="ownerUserId">Owner user ID</Label>
              <Input
                id="ownerUserId"
                placeholder="users/..."
                {...register("ownerUserId")}
                className={cn(errors.ownerUserId && "border-destructive")}
              />
              {errors.ownerUserId ? (
                <p className="text-xs text-destructive">{errors.ownerUserId.message}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="transferDate">Transfer date</Label>
                <DateField
                  name="transferDate"
                  control={control}
                  placeholder="Pick a date"
                  className={cn(errors.transferDate && "border-destructive")}
                />
                {errors.transferDate ? (
                  <p className="text-xs text-destructive">{errors.transferDate.message}</p>
                ) : null}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="branchId">Branch (optional)</Label>
                <Input id="branchId" {...register("branchId")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="fromAccount">From account</Label>
                <Input id="fromAccount" placeholder="e.g., Company wallet" {...register("fromAccount")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="toAccount">To account</Label>
                <Input id="toAccount" placeholder="e.g., Owner personal" {...register("toAccount")} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" placeholder="Expansion, Salary, Repayment" {...register("category")} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>
          </ResponsiveDialog.Body>

          <ResponsiveDialog.Footer>
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create transfer"}
            </Button>
          </ResponsiveDialog.Footer>
        </form>
      </ResponsiveDialog>
    </>
  )
}
