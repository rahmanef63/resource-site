"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Ban, CheckCircle, Lock, Send, X, XCircle } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import type { Id } from "@convex/_generated/dataModel"
import { RequestStateBadge } from "./RequestStateBadge"
import { availableActions } from "../hooks/usePettyCash"
import {
  DISBURSEMENT_METHODS,
  DISBURSEMENT_METHOD_LABELS,
  closeSchema,
  disburseSchema,
  rejectSchema,
  type CloseInput,
  type DisburseInput,
  type DisbursementMethod,
  type PettyCashRequest,
  type RejectInput,
} from "../types"

type InlineMode = "reject" | "disburse" | "close" | null

function formatAmount(value: number, currency: string) {
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
  request: PettyCashRequest | null
  onClose: () => void
  onApprove: (id: Id<"pettyCashRequests">) => Promise<void> | void
  onReject: (id: Id<"pettyCashRequests">, input: RejectInput) => Promise<void> | void
  onDisburse: (id: Id<"pettyCashRequests">, input: DisburseInput) => Promise<void> | void
  onCloseRequest: (id: Id<"pettyCashRequests">, input: CloseInput) => Promise<void> | void
  onCancel: (id: Id<"pettyCashRequests">) => Promise<void> | void
}

export function RequestDetailDrawer({
  request,
  onClose,
  onApprove,
  onReject,
  onDisburse,
  onCloseRequest,
  onCancel,
}: Props) {
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<InlineMode>(null)

  if (!request) return null

  const actions = availableActions(request.status)

  const runApprove = async () => {
    setBusy(true)
    try {
      await onApprove(request._id)
    } finally {
      setBusy(false)
    }
  }

  const runCancel = async () => {
    setBusy(true)
    try {
      await onCancel(request._id)
    } finally {
      setBusy(false)
    }
  }

  const hasApprove = actions.some((a) => a.id === "approve")
  const hasReject = actions.some((a) => a.id === "reject")
  const hasDisburse = actions.some((a) => a.id === "disburse")
  const hasClose = actions.some((a) => a.id === "close")
  const hasCancel = actions.some((a) => a.id === "cancel")

  return (
    <PanelSection>
      <PanelSection.Header className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Petty cash request</p>
          <h2 className="text-lg font-semibold">{formatAmount(request.amount, request.currency)}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{request.purpose}</p>
        </div>
        <div className="flex items-center gap-2">
          <RequestStateBadge status={request.status} />
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PanelSection.Header>

      <PanelSection.Items className="p-4 text-sm">
        <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
          <dt className="text-muted-foreground">Category</dt>
          <dd className="col-span-2 truncate">{request.category ?? "—"}</dd>

          <dt className="text-muted-foreground">Branch</dt>
          <dd className="col-span-2 truncate">{request.branchId ?? "—"}</dd>

          <dt className="text-muted-foreground">Requester</dt>
          <dd className="col-span-2 truncate font-mono text-xs">{String(request.requesterId)}</dd>

          <dt className="text-muted-foreground">Created</dt>
          <dd className="col-span-2">{formatRelativeTime(request.createdAt)}</dd>

          {request.approvedAt ? (
            <>
              <dt className="text-muted-foreground">Approved</dt>
              <dd className="col-span-2">{formatRelativeTime(request.approvedAt)}</dd>
            </>
          ) : null}

          {request.rejectedReason ? (
            <>
              <dt className="text-muted-foreground">Rejected reason</dt>
              <dd className="col-span-2 text-red-600">{request.rejectedReason}</dd>
            </>
          ) : null}

          {request.closedAt ? (
            <>
              <dt className="text-muted-foreground">Closed</dt>
              <dd className="col-span-2">{formatRelativeTime(request.closedAt)}</dd>
            </>
          ) : null}
        </dl>

        {request.notes ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{request.notes}</p>
          </>
        ) : null}

        {request.attachments && request.attachments.length > 0 ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Attachments</p>
            <ul className="mt-1 space-y-1 text-xs">
              {request.attachments.map((url) => (
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
      </PanelSection.Items>

      {actions.length > 0 ? (
        <PanelSection.Footer className="p-3">
          {mode === "reject" ? (
            <RejectForm
              busy={busy}
              onCancel={() => setMode(null)}
              onSubmit={async (input) => {
                setBusy(true)
                try {
                  await onReject(request._id, input)
                  setMode(null)
                } finally {
                  setBusy(false)
                }
              }}
            />
          ) : mode === "disburse" ? (
            <DisburseForm
              busy={busy}
              onCancel={() => setMode(null)}
              onSubmit={async (input) => {
                setBusy(true)
                try {
                  await onDisburse(request._id, input)
                  setMode(null)
                } finally {
                  setBusy(false)
                }
              }}
            />
          ) : mode === "close" ? (
            <CloseForm
              approvedAmount={request.amount}
              currency={request.currency}
              busy={busy}
              onCancel={() => setMode(null)}
              onSubmit={async (input) => {
                setBusy(true)
                try {
                  await onCloseRequest(request._id, input)
                  setMode(null)
                } finally {
                  setBusy(false)
                }
              }}
            />
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {hasApprove ? (
                <Button size="sm" disabled={busy} onClick={runApprove} className="gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Approve
                </Button>
              ) : null}
              {hasReject ? (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setMode("reject")}
                  className="gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Reject
                </Button>
              ) : null}
              {hasDisburse ? (
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => setMode("disburse")}
                  className="gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  Disburse
                </Button>
              ) : null}
              {hasClose ? (
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={() => setMode("close")}
                  className="gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Close
                </Button>
              ) : null}
              {hasCancel ? (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={runCancel}
                  className="gap-1.5"
                >
                  <Ban className="h-3.5 w-3.5" />
                  Cancel
                </Button>
              ) : null}
            </div>
          )}
        </PanelSection.Footer>
      ) : null}
    </PanelSection>
  )
}

// ---------- Inline forms ----------

function RejectForm({
  busy,
  onCancel,
  onSubmit,
}: {
  busy: boolean
  onCancel: () => void
  onSubmit: (input: RejectInput) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectInput>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: "" },
  })

  return (
    <form className="space-y-2" onSubmit={handleSubmit((v) => onSubmit(v))}>
      <Label htmlFor="reject-reason" className="text-xs">
        Rejection reason
      </Label>
      <Textarea
        id="reject-reason"
        rows={2}
        placeholder="Why is this being rejected?"
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
          <XCircle className="h-3.5 w-3.5" />
          Confirm reject
        </Button>
      </div>
    </form>
  )
}

function DisburseForm({
  busy,
  onCancel,
  onSubmit,
}: {
  busy: boolean
  onCancel: () => void
  onSubmit: (input: DisburseInput) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DisburseInput>({
    resolver: zodResolver(disburseSchema),
    defaultValues: { method: "cash", receiptUrl: "" },
  })

  const method = watch("method")

  return (
    <form className="space-y-2" onSubmit={handleSubmit((v) => onSubmit(v))}>
      <div className="grid gap-2">
        <Label htmlFor="disburse-method" className="text-xs">
          Disbursement method
        </Label>
        <Select value={method} onValueChange={(v) => setValue("method", v as DisbursementMethod)}>
          <SelectTrigger id="disburse-method">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DISBURSEMENT_METHODS.map((m) => (
              <SelectItem key={m} value={m}>
                {DISBURSEMENT_METHOD_LABELS[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="disburse-receipt" className="text-xs">
          Receipt URL (optional)
        </Label>
        <Input
          id="disburse-receipt"
          placeholder="https://..."
          {...register("receiptUrl")}
          className={cn(errors.receiptUrl && "border-destructive")}
        />
        {errors.receiptUrl ? (
          <p className="text-xs text-destructive">{errors.receiptUrl.message}</p>
        ) : null}
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          Back
        </Button>
        <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
          <Send className="h-3.5 w-3.5" />
          Confirm disburse
        </Button>
      </div>
    </form>
  )
}

function CloseForm({
  approvedAmount,
  currency,
  busy,
  onCancel,
  onSubmit,
}: {
  approvedAmount: number
  currency: string
  busy: boolean
  onCancel: () => void
  onSubmit: (input: CloseInput) => Promise<void>
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CloseInput>({
    resolver: zodResolver(closeSchema),
    defaultValues: { actualAmount: approvedAmount, closingNotes: "" },
  })

  const actualAmount = Number(watch("actualAmount")) || 0
  const variance = actualAmount - approvedAmount

  return (
    <form className="space-y-2" onSubmit={handleSubmit((v) => onSubmit(v))}>
      <div className="grid gap-2">
        <Label htmlFor="close-actual" className="text-xs">
          Actual amount spent
        </Label>
        <Input
          id="close-actual"
          type="number"
          step="1"
          min={0}
          {...register("actualAmount")}
          className={cn(errors.actualAmount && "border-destructive")}
        />
        {errors.actualAmount ? (
          <p className="text-xs text-destructive">{errors.actualAmount.message}</p>
        ) : null}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">
            Approved: {formatAmount(approvedAmount, currency)}
          </span>
          <span
            className={cn(
              "font-semibold",
              variance === 0
                ? "text-muted-foreground"
                : variance > 0
                  ? "text-red-600"
                  : "text-emerald-600",
            )}
          >
            Variance: {variance > 0 ? "+" : ""}
            {formatAmount(variance, currency)}
          </span>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="close-notes" className="text-xs">
          Closing notes (optional)
        </Label>
        <Textarea id="close-notes" rows={2} {...register("closingNotes")} />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={busy}>
          Back
        </Button>
        <Button type="submit" size="sm" disabled={busy} className="gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          Confirm close
        </Button>
      </div>
    </form>
  )
}
