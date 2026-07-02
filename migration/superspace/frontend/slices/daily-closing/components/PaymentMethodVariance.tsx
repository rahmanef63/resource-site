"use client"

import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Calculator, Plus, Save } from "lucide-react"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  upsertItemSchema,
  type DailyClosingItem,
  type PaymentMethod,
  type UpsertItemInput,
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

function formatSignedIDR(value: number) {
  const sign = value > 0 ? "+" : ""
  return `${sign}${formatIDR(value)}`
}

interface Props {
  items: DailyClosingItem[]
  readOnly?: boolean
  busy?: boolean
  onUpsert: (input: UpsertItemInput) => Promise<void> | void
}

export function PaymentMethodVariance({ items, readOnly, busy, onUpsert }: Props) {
  const [showAdd, setShowAdd] = useState(false)

  const totals = useMemo(
    () =>
      items.reduce(
        (acc, it) => {
          acc.expected += it.expectedAmount
          acc.actual += it.actualAmount
          acc.variance += it.variance
          return acc
        },
        { expected: 0, actual: 0, variance: 0 },
      ),
    [items],
  )

  const usedMethods = useMemo(
    () => new Set(items.map((i) => i.paymentMethod)),
    [items],
  )

  const defaultNewMethod = useMemo<PaymentMethod>(() => {
    for (const m of PAYMENT_METHODS) if (!usedMethods.has(m)) return m
    return "other"
  }, [usedMethods])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Payment-method variance
        </p>
        {!readOnly ? (
          <Button
            type="button"
            size="sm"
            variant={showAdd ? "ghost" : "outline"}
            className="gap-1.5"
            onClick={() => setShowAdd((v) => !v)}
            disabled={busy}
          >
            <Plus className="h-3.5 w-3.5" />
            {showAdd ? "Close" : "Add method"}
          </Button>
        ) : null}
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Expected</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-xs text-muted-foreground">
                  No variance rows yet. Add per-method expected vs actual to track drift.
                </TableCell>
              </TableRow>
            ) : null}
            {items.map((row) => (
              <MethodRow
                key={row._id}
                row={row}
                readOnly={readOnly}
                busy={busy}
                onUpsert={onUpsert}
              />
            ))}
            {items.length > 0 ? (
              <TableRow className="bg-muted/30 font-medium">
                <TableCell>Totals</TableCell>
                <TableCell className="text-right">{formatIDR(totals.expected)}</TableCell>
                <TableCell className="text-right">{formatIDR(totals.actual)}</TableCell>
                <TableCell
                  className={cn(
                    "text-right",
                    totals.variance === 0
                      ? "text-muted-foreground"
                      : totals.variance > 0
                        ? "text-emerald-600"
                        : "text-red-600",
                  )}
                >
                  {formatSignedIDR(totals.variance)}
                </TableCell>
                <TableCell />
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>

      {showAdd && !readOnly ? (
        <AddMethodRow
          defaultMethod={defaultNewMethod}
          usedMethods={usedMethods}
          busy={busy}
          onCancel={() => setShowAdd(false)}
          onSubmit={async (input) => {
            await onUpsert(input)
            setShowAdd(false)
          }}
        />
      ) : null}
    </div>
  )
}

// ---------- existing-row edit ----------

function MethodRow({
  row,
  readOnly,
  busy,
  onUpsert,
}: {
  row: DailyClosingItem
  readOnly?: boolean
  busy?: boolean
  onUpsert: (input: UpsertItemInput) => Promise<void> | void
}) {
  const [editing, setEditing] = useState(false)

  if (!editing) {
    const varianceColor =
      row.variance === 0
        ? "text-muted-foreground"
        : row.variance > 0
          ? "text-emerald-600"
          : "text-red-600"
    return (
      <TableRow
        className={cn(!readOnly && "cursor-pointer")}
        onClick={() => {
          if (!readOnly) setEditing(true)
        }}
      >
        <TableCell className="font-medium">
          {PAYMENT_METHOD_LABELS[row.paymentMethod as PaymentMethod] ?? row.paymentMethod}
        </TableCell>
        <TableCell className="text-right">{formatIDR(row.expectedAmount)}</TableCell>
        <TableCell className="text-right">{formatIDR(row.actualAmount)}</TableCell>
        <TableCell className={cn("text-right font-medium", varianceColor)}>
          {formatSignedIDR(row.variance)}
        </TableCell>
        <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
          {row.notes ?? "—"}
        </TableCell>
      </TableRow>
    )
  }

  return (
    <EditMethodRow
      row={row}
      busy={busy}
      onCancel={() => setEditing(false)}
      onSubmit={async (input) => {
        await onUpsert(input)
        setEditing(false)
      }}
    />
  )
}

function EditMethodRow({
  row,
  busy,
  onCancel,
  onSubmit,
}: {
  row: DailyClosingItem
  busy?: boolean
  onCancel: () => void
  onSubmit: (input: UpsertItemInput) => Promise<void> | void
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpsertItemInput>({
    resolver: zodResolver(upsertItemSchema),
    defaultValues: {
      paymentMethod: row.paymentMethod,
      expectedAmount: row.expectedAmount,
      actualAmount: row.actualAmount,
      notes: row.notes ?? "",
    },
  })

  const expected = Number(watch("expectedAmount")) || 0
  const actual = Number(watch("actualAmount")) || 0
  const variance = actual - expected
  const varianceColor =
    variance === 0
      ? "text-muted-foreground"
      : variance > 0
        ? "text-emerald-600"
        : "text-red-600"

  const working = busy || isSubmitting

  return (
    <TableRow className="bg-muted/30">
      <TableCell className="font-medium">
        {PAYMENT_METHOD_LABELS[row.paymentMethod as PaymentMethod] ?? row.paymentMethod}
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="1"
          min={0}
          {...register("expectedAmount")}
          className={cn("h-8 text-right", errors.expectedAmount && "border-destructive")}
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          step="1"
          min={0}
          {...register("actualAmount")}
          className={cn("h-8 text-right", errors.actualAmount && "border-destructive")}
        />
      </TableCell>
      <TableCell className={cn("text-right font-medium", varianceColor)}>
        {formatSignedIDR(variance)}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Input
            placeholder="Notes"
            {...register("notes")}
            className="h-8"
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 px-2"
            onClick={onCancel}
            disabled={working}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1 px-2"
            disabled={working}
            onClick={handleSubmit((v) => onSubmit(v))}
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

// ---------- add-method row ----------

function AddMethodRow({
  defaultMethod,
  usedMethods,
  busy,
  onCancel,
  onSubmit,
}: {
  defaultMethod: PaymentMethod
  usedMethods: Set<string>
  busy?: boolean
  onCancel: () => void
  onSubmit: (input: UpsertItemInput) => Promise<void> | void
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpsertItemInput>({
    resolver: zodResolver(upsertItemSchema),
    defaultValues: {
      paymentMethod: defaultMethod,
      expectedAmount: 0,
      actualAmount: 0,
      notes: "",
    },
  })

  const method = watch("paymentMethod") as PaymentMethod
  const expected = Number(watch("expectedAmount")) || 0
  const actual = Number(watch("actualAmount")) || 0
  const variance = actual - expected
  const varianceColor =
    variance === 0
      ? "text-muted-foreground"
      : variance > 0
        ? "text-emerald-600"
        : "text-red-600"

  const working = busy || isSubmitting

  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <Calculator className="h-3 w-3" />
        Add payment method
      </p>
      <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr_1fr_auto]">
        <div className="grid gap-1">
          <Label className="text-[11px]" htmlFor="pm-select">
            Method
          </Label>
          <Select
            value={method}
            onValueChange={(v) => setValue("paymentMethod", v)}
          >
            <SelectTrigger id="pm-select" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHODS.map((m) => (
                <SelectItem key={m} value={m} disabled={usedMethods.has(m)}>
                  {PAYMENT_METHOD_LABELS[m]}
                  {usedMethods.has(m) ? " (used)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.paymentMethod ? (
            <p className="text-[10px] text-destructive">{errors.paymentMethod.message}</p>
          ) : null}
        </div>

        <div className="grid gap-1">
          <Label className="text-[11px]" htmlFor="pm-expected">
            Expected
          </Label>
          <Input
            id="pm-expected"
            type="number"
            step="1"
            min={0}
            {...register("expectedAmount")}
            className={cn("h-8 text-right", errors.expectedAmount && "border-destructive")}
          />
        </div>

        <div className="grid gap-1">
          <Label className="text-[11px]" htmlFor="pm-actual">
            Actual
          </Label>
          <Input
            id="pm-actual"
            type="number"
            step="1"
            min={0}
            {...register("actualAmount")}
            className={cn("h-8 text-right", errors.actualAmount && "border-destructive")}
          />
        </div>

        <div className="grid gap-1">
          <Label className="text-[11px]">Variance</Label>
          <div
            className={cn(
              "flex h-8 items-center justify-end rounded-md border bg-background px-2 text-sm font-medium",
              varianceColor,
            )}
          >
            {formatSignedIDR(variance)}
          </div>
        </div>

        <div className="flex items-end gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={working}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="gap-1"
            disabled={working}
            onClick={handleSubmit((v) => onSubmit(v))}
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </div>

      <div className="mt-3">
        <Label className="text-[11px]" htmlFor="pm-notes">
          Notes (optional)
        </Label>
        <Input
          id="pm-notes"
          {...register("notes")}
          className="mt-1 h-8"
          placeholder="Reason for variance, reconciliation detail…"
        />
      </div>
    </div>
  )
}
