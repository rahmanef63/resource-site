"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChevronDown, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DateField } from "@/frontend/shared/foundation/utils/datepicker"
import { cn } from "@/lib/utils"
import {
  BUCKET_LABELS,
  EXPENSE_BUCKETS,
  REVENUE_BUCKETS,
  addLineItemSchema,
  type AddLineItemInput,
  type Bucket,
  type LineItem,
} from "../types"

function formatIDR(value: number) {
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `IDR ${value.toLocaleString()}`
  }
}

/**
 * Tailwind tone class per bucket — revenue green, expense red, capex purple.
 */
export function bucketTone(bucket: Bucket): string {
  if (REVENUE_BUCKETS.includes(bucket)) return "text-emerald-600"
  if (bucket === "capex") return "text-purple-600"
  if (EXPENSE_BUCKETS.includes(bucket)) return "text-red-600"
  return "text-muted-foreground"
}

export function bucketSoftBg(bucket: Bucket): string {
  if (REVENUE_BUCKETS.includes(bucket)) return "bg-emerald-50 dark:bg-emerald-950/30"
  if (bucket === "capex") return "bg-purple-50 dark:bg-purple-950/30"
  if (EXPENSE_BUCKETS.includes(bucket)) return "bg-red-50 dark:bg-red-950/30"
  return "bg-muted"
}

interface Props {
  bucket: Bucket
  items: LineItem[]
  editable: boolean
  onAdd: (input: AddLineItemInput) => Promise<unknown>
}

export function LineItemBuckets({ bucket, items, editable, onAdd }: Props) {
  const [expanded, setExpanded] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const bucketItems = items.filter((i) => i.bucket === bucket)
  const total = bucketItems.reduce((acc, i) => acc + i.amount * ((i.probability ?? 1)), 0)

  return (
    <div className="rounded-md border">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium",
          bucketSoftBg(bucket),
        )}
      >
        <span className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          <span className={cn(bucketTone(bucket))}>{BUCKET_LABELS[bucket]}</span>
          <span className="text-xs text-muted-foreground">({bucketItems.length})</span>
        </span>
        <span className={cn("font-mono text-xs", bucketTone(bucket))}>
          {formatIDR(total)}
        </span>
      </button>

      {expanded ? (
        <div className="divide-y">
          {bucketItems.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No items.</p>
          ) : (
            bucketItems.map((i) => (
              <div key={i._id} className="flex items-start justify-between gap-3 px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{i.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.expectedDate ? `Expected ${i.expectedDate}` : "Undated"}
                    {i.probability !== undefined
                      ? ` · ${Math.round(i.probability * 100)}% probability`
                      : ""}
                  </p>
                  {i.note ? (
                    <p className="mt-1 whitespace-pre-wrap text-xs text-muted-foreground">
                      {i.note}
                    </p>
                  ) : null}
                </div>
                <p className={cn("font-mono text-xs", bucketTone(bucket))}>
                  {formatIDR(i.amount)}
                </p>
              </div>
            ))
          )}

          {editable ? (
            <div className="p-3">
              {addOpen ? (
                <AddLineItemForm
                  bucket={bucket}
                  busy={busy}
                  onCancel={() => setAddOpen(false)}
                  onSubmit={async (input) => {
                    setBusy(true)
                    try {
                      await onAdd(input)
                      setAddOpen(false)
                    } finally {
                      setBusy(false)
                    }
                  }}
                />
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full gap-1.5"
                  onClick={() => setAddOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add item
                </Button>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function AddLineItemForm({
  bucket,
  busy,
  onCancel,
  onSubmit,
}: {
  bucket: Bucket
  busy: boolean
  onCancel: () => void
  onSubmit: (input: AddLineItemInput) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AddLineItemInput>({
    resolver: zodResolver(addLineItemSchema),
    defaultValues: {
      bucket,
      label: "",
      amount: 0,
      probability: undefined,
      expectedDate: "",
      note: "",
    },
  })

  return (
    <form
      className="space-y-2"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({ ...values, bucket })
      })}
    >
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1">
          <Label htmlFor={`label-${bucket}`} className="text-xs">
            Label
          </Label>
          <Input
            id={`label-${bucket}`}
            placeholder="e.g., Subscription revenue"
            {...register("label")}
            className={cn(errors.label && "border-destructive")}
          />
          {errors.label ? (
            <p className="text-[11px] text-destructive">{errors.label.message}</p>
          ) : null}
        </div>
        <div className="grid gap-1">
          <Label htmlFor={`amount-${bucket}`} className="text-xs">
            Amount (IDR)
          </Label>
          <Input
            id={`amount-${bucket}`}
            type="number"
            step="1"
            min={1}
            {...register("amount")}
            className={cn(errors.amount && "border-destructive")}
          />
          {errors.amount ? (
            <p className="text-[11px] text-destructive">{errors.amount.message}</p>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="grid gap-1">
          <Label htmlFor={`probability-${bucket}`} className="text-xs">
            Probability (0-1)
          </Label>
          <Input
            id={`probability-${bucket}`}
            type="number"
            step="0.01"
            min={0}
            max={1}
            placeholder="1.00"
            {...register("probability")}
            className={cn(errors.probability && "border-destructive")}
          />
          {errors.probability ? (
            <p className="text-[11px] text-destructive">{errors.probability.message}</p>
          ) : null}
        </div>
        <div className="grid gap-1">
          <Label className="text-xs">Expected date</Label>
          <DateField name="expectedDate" control={control} placeholder="Expected date" />
        </div>
      </div>
      <div className="grid gap-1">
        <Label htmlFor={`note-${bucket}`} className="text-xs">
          Note (optional)
        </Label>
        <Textarea id={`note-${bucket}`} rows={2} {...register("note")} />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          Back
        </Button>
        <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add item
        </Button>
      </div>
    </form>
  )
}
