"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { recordSalesSchema, type RecordSalesInput } from "../types"

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

interface Props {
  defaults?: Partial<RecordSalesInput>
  readOnly?: boolean
  busy?: boolean
  onSubmit: (input: RecordSalesInput) => Promise<void> | void
}

export function RecordSalesForm({ defaults, readOnly, busy, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RecordSalesInput>({
    resolver: zodResolver(recordSalesSchema),
    defaultValues: {
      cashSales: defaults?.cashSales,
      cardSales: defaults?.cardSales,
      qrisSales: defaults?.qrisSales,
      otherSales: defaults?.otherSales,
    },
  })

  const values = watch()
  const total =
    (Number(values.cashSales) || 0) +
    (Number(values.cardSales) || 0) +
    (Number(values.qrisSales) || 0) +
    (Number(values.otherSales) || 0)

  const working = busy || isSubmitting

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit((v) => onSubmit(v))}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="cashSales" className="text-xs">
            Cash sales
          </Label>
          <Input
            id="cashSales"
            type="number"
            step="1"
            min={0}
            disabled={readOnly}
            {...register("cashSales")}
            className={cn(errors.cashSales && "border-destructive")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cardSales" className="text-xs">
            Card sales
          </Label>
          <Input
            id="cardSales"
            type="number"
            step="1"
            min={0}
            disabled={readOnly}
            {...register("cardSales")}
            className={cn(errors.cardSales && "border-destructive")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="qrisSales" className="text-xs">
            QRIS sales
          </Label>
          <Input
            id="qrisSales"
            type="number"
            step="1"
            min={0}
            disabled={readOnly}
            {...register("qrisSales")}
            className={cn(errors.qrisSales && "border-destructive")}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="otherSales" className="text-xs">
            Other sales
          </Label>
          <Input
            id="otherSales"
            type="number"
            step="1"
            min={0}
            disabled={readOnly}
            {...register("otherSales")}
            className={cn(errors.otherSales && "border-destructive")}
          />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
        <span className="text-muted-foreground">Total sales</span>
        <span className="font-semibold">{formatIDR(total)}</span>
      </div>

      {!readOnly ? (
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={working} className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />
            {working ? "Saving…" : "Save sales"}
          </Button>
        </div>
      ) : null}
    </form>
  )
}
