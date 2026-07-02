"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { closeDaySchema, type CloseDayInput } from "../types"

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

function formatSignedIDR(value: number) {
  const sign = value > 0 ? "+" : ""
  return `${sign}${formatIDR(value)}`
}

interface Props {
  /**
   * Cash value the till is expected to contain. Falls back to totalSales if the
   * backend hasn't populated expectedCash yet.
   */
  expectedCash: number
  totalSales?: number
  defaults?: Partial<CloseDayInput>
  readOnly?: boolean
  busy?: boolean
  onSubmit: (input: CloseDayInput) => Promise<void> | void
}

export function CloseDayForm({
  expectedCash,
  totalSales,
  defaults,
  readOnly,
  busy,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CloseDayInput>({
    resolver: zodResolver(closeDaySchema),
    defaultValues: {
      actualCash: defaults?.actualCash ?? expectedCash,
      closingNotes: defaults?.closingNotes ?? "",
    },
  })

  const actualCash = Number(watch("actualCash")) || 0
  const difference = actualCash - expectedCash
  const diffColor =
    difference === 0
      ? "text-muted-foreground"
      : difference > 0
        ? "text-emerald-600"
        : "text-red-600"

  const working = busy || isSubmitting

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit((v) => onSubmit(v))}
    >
      <div className="grid gap-2">
        <Label htmlFor="actualCash" className="text-xs">
          Actual cash counted
        </Label>
        <Input
          id="actualCash"
          type="number"
          step="1"
          min={0}
          disabled={readOnly}
          {...register("actualCash")}
          className={cn(errors.actualCash && "border-destructive")}
        />
        {errors.actualCash ? (
          <p className="text-xs text-destructive">{errors.actualCash.message}</p>
        ) : null}
      </div>

      <div className="rounded-md border bg-muted/30 p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Expected cash</span>
          <span className="font-medium">{formatIDR(expectedCash)}</span>
        </div>
        {typeof totalSales === "number" ? (
          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total sales (all methods)</span>
            <span className="text-muted-foreground">{formatIDR(totalSales)}</span>
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-between border-t pt-2">
          <span className="text-muted-foreground">Difference</span>
          <span className={cn("font-semibold", diffColor)}>
            {formatSignedIDR(difference)}
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="closingNotes" className="text-xs">
          Closing notes (optional)
        </Label>
        <Textarea
          id="closingNotes"
          rows={3}
          disabled={readOnly}
          placeholder="Why the difference? Shift hand-off notes, discrepancies, etc."
          {...register("closingNotes")}
        />
      </div>

      {!readOnly ? (
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={working} className="gap-1.5">
            <Lock className="h-3.5 w-3.5" />
            {working ? "Closing…" : "Close day"}
          </Button>
        </div>
      ) : null}
    </form>
  )
}
