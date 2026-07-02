"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Archive, ArrowRightLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import type { Id } from "@convex/_generated/dataModel"
import { AssetStateBadge } from "./AssetStateBadge"
import { AssetTransactionLedger } from "./AssetTransactionLedger"
import { availableActions } from "../hooks/useAssetManagement"
import {
  DEPRECIATION_METHOD_LABELS,
  retireAssetSchema,
  transferAssetSchema,
  type ManagedAssetWithTransactions,
  type RetireAssetInput,
  type TransferAssetInput,
} from "../types"

type InlineMode = "transfer" | "retire" | null

function formatAmount(value: number | undefined, currency = "IDR") {
  if (value === undefined || value === null) return "—"
  try {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

interface Props {
  asset: ManagedAssetWithTransactions | null | undefined
  onClose: () => void
  onTransfer: (id: Id<"managedAssets">, input: TransferAssetInput) => Promise<void> | void
  onRetire: (id: Id<"managedAssets">, input: RetireAssetInput) => Promise<void> | void
}

export function AssetDetailDrawer({ asset, onClose, onTransfer, onRetire }: Props) {
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<InlineMode>(null)

  if (!asset) return null

  const actions = availableActions(asset.status)
  const hasTransfer = actions.some((a) => a.id === "transfer")
  const hasRetire = actions.some((a) => a.id === "retire")

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Managed asset</p>
          <h2 className="text-lg font-semibold">{asset.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {asset.category}
            {asset.serialNumber ? ` · SN ${asset.serialNumber}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AssetStateBadge status={asset.status} />
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 text-sm">
        <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
          <dt className="text-muted-foreground">Location</dt>
          <dd className="col-span-2 truncate">{asset.location ?? "—"}</dd>

          <dt className="text-muted-foreground">Branch</dt>
          <dd className="col-span-2 truncate">{asset.branchId ?? "—"}</dd>

          <dt className="text-muted-foreground">Assignee</dt>
          <dd className="col-span-2 truncate font-mono text-xs">
            {asset.assignedTo ? String(asset.assignedTo) : "—"}
          </dd>

          <dt className="text-muted-foreground">Purchase date</dt>
          <dd className="col-span-2">{asset.purchaseDate ?? "—"}</dd>

          <dt className="text-muted-foreground">Purchase price</dt>
          <dd className="col-span-2">{formatAmount(asset.purchasePrice)}</dd>

          <dt className="text-muted-foreground">Current value</dt>
          <dd className="col-span-2 font-medium">{formatAmount(asset.currentValue)}</dd>

          <dt className="text-muted-foreground">Depreciation</dt>
          <dd className="col-span-2">
            {asset.depreciationMethod
              ? DEPRECIATION_METHOD_LABELS[asset.depreciationMethod]
              : "—"}
            {asset.usefulLifeYears ? ` · ${asset.usefulLifeYears} yr` : ""}
          </dd>

          <dt className="text-muted-foreground">Registered</dt>
          <dd className="col-span-2">{formatRelativeTime(asset.createdAt)}</dd>

          <dt className="text-muted-foreground">Updated</dt>
          <dd className="col-span-2">{formatRelativeTime(asset.updatedAt)}</dd>
        </dl>

        {asset.notes ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{asset.notes}</p>
          </>
        ) : null}

        {asset.photos && asset.photos.length > 0 ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Photos</p>
            <ul className="mt-1 space-y-1 text-xs">
              {asset.photos.map((url) => (
                <li key={url}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-blue-600 underline hover:no-underline"
                  >
                    {url}
                  </a>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <Separator className="my-4" />
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Transaction ledger
        </p>
        <div className="mt-3">
          <AssetTransactionLedger transactions={asset.transactions} />
        </div>
      </div>

      {actions.length > 0 ? (
        <div className="border-t bg-muted/30 p-3">
          {mode === "transfer" ? (
            <TransferForm
              currentLocation={asset.location}
              currentAssignee={asset.assignedTo ? String(asset.assignedTo) : undefined}
              busy={busy}
              onCancel={() => setMode(null)}
              onSubmit={async (input) => {
                setBusy(true)
                try {
                  await onTransfer(asset._id, input)
                  setMode(null)
                } finally {
                  setBusy(false)
                }
              }}
            />
          ) : mode === "retire" ? (
            <RetireForm
              busy={busy}
              onCancel={() => setMode(null)}
              onSubmit={async (input) => {
                setBusy(true)
                try {
                  await onRetire(asset._id, input)
                  setMode(null)
                } finally {
                  setBusy(false)
                }
              }}
            />
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {hasTransfer ? (
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => setMode("transfer")}
                  className="gap-1.5"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Transfer
                </Button>
              ) : null}
              {hasRetire ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setMode("retire")}
                  className="gap-1.5"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Retire
                </Button>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

// ---------- Inline forms ----------

function TransferForm({
  currentLocation,
  currentAssignee,
  busy,
  onCancel,
  onSubmit,
}: {
  currentLocation: string | undefined
  currentAssignee: string | undefined
  busy: boolean
  onCancel: () => void
  onSubmit: (input: TransferAssetInput) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferAssetInput>({
    resolver: zodResolver(transferAssetSchema),
    defaultValues: { toLocation: "", toAssignee: "", notes: "" },
  })

  return (
    <form className="space-y-2" onSubmit={handleSubmit((v) => onSubmit(v))}>
      <div className="grid gap-2">
        <Label htmlFor="transfer-location" className="text-xs">
          New location
        </Label>
        <Input
          id="transfer-location"
          placeholder={currentLocation ?? "e.g., Branch-B kitchen"}
          {...register("toLocation")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="transfer-assignee" className="text-xs">
          New assignee (user ID)
        </Label>
        <Input
          id="transfer-assignee"
          placeholder={currentAssignee ?? "users/..."}
          {...register("toAssignee")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="transfer-notes" className="text-xs">
          Notes
        </Label>
        <Textarea
          id="transfer-notes"
          rows={2}
          {...register("notes")}
          className={cn(errors.notes && "border-destructive")}
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          Back
        </Button>
        <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
          <ArrowRightLeft className="h-3.5 w-3.5" />
          Confirm transfer
        </Button>
      </div>
    </form>
  )
}

function RetireForm({
  busy,
  onCancel,
  onSubmit,
}: {
  busy: boolean
  onCancel: () => void
  onSubmit: (input: RetireAssetInput) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RetireAssetInput>({
    resolver: zodResolver(retireAssetSchema),
    defaultValues: { reason: "" },
  })

  return (
    <form className="space-y-2" onSubmit={handleSubmit((v) => onSubmit(v))}>
      <Label htmlFor="retire-reason" className="text-xs">
        Retirement reason
      </Label>
      <Textarea
        id="retire-reason"
        rows={2}
        placeholder="e.g., end-of-life / sold / damaged beyond repair"
        {...register("reason")}
        className={cn(errors.reason && "border-destructive")}
      />
      {errors.reason ? (
        <p className="text-xs text-destructive">{errors.reason.message}</p>
      ) : null}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          Back
        </Button>
        <Button type="submit" size="sm" variant="destructive" disabled={busy} className="gap-1.5">
          <Archive className="h-3.5 w-3.5" />
          Confirm retire
        </Button>
      </div>
    </form>
  )
}
