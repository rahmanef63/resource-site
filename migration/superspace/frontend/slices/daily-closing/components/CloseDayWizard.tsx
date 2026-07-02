"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Calculator,
  CheckCircle,
  DollarSign,
  Lock,
  PlayCircle,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import type { Id } from "@convex/_generated/dataModel"
import { ClosingStateBadge } from "./ClosingStateBadge"
import { RecordSalesForm } from "./RecordSalesForm"
import { PaymentMethodVariance } from "./PaymentMethodVariance"
import { CloseDayForm } from "./CloseDayForm"
import { currentStep, useDailyClosingItems } from "../hooks/useDailyClosing"
import type {
  CloseDayInput,
  DailyClosing,
  RecordSalesInput,
  UpsertItemInput,
} from "../types"

function formatIDR(value: number | undefined) {
  if (value === undefined || value === null) return "—"
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

function formatSignedIDR(value: number | undefined) {
  if (value === undefined || value === null) return "—"
  const sign = value > 0 ? "+" : ""
  return `${sign}${formatIDR(value)}`
}

type StepKey = "open" | "sales" | "variance" | "close" | "approve"

const STEPS: Array<{
  key: StepKey
  label: string
  Icon: React.ComponentType<{ className?: string }>
}> = [
  { key: "open", label: "Open", Icon: PlayCircle },
  { key: "sales", label: "Sales", Icon: DollarSign },
  { key: "variance", label: "Variance", Icon: Calculator },
  { key: "close", label: "Close", Icon: Lock },
  { key: "approve", label: "Approve", Icon: CheckCircle },
]

/**
 * Steps that are unlocked at each closing status. A step is considered
 * completed once its required state transition has happened.
 */
function completedSteps(status: DailyClosing["status"]): Record<StepKey, boolean> {
  switch (status) {
    case "open":
      return { open: true, sales: false, variance: false, close: false, approve: false }
    case "recorded":
      return { open: true, sales: true, variance: false, close: false, approve: false }
    case "closed":
      return { open: true, sales: true, variance: true, close: true, approve: false }
    case "approved":
      return { open: true, sales: true, variance: true, close: true, approve: true }
    case "disputed":
      // Disputed closings have been submitted but flagged; treat variance/close as done.
      return { open: true, sales: true, variance: true, close: true, approve: false }
  }
}

interface Props {
  workspaceId: Id<"workspaces">
  closing: DailyClosing
  onClose: () => void
  onRecordSales: (
    closingId: Id<"dailyClosings">,
    input: RecordSalesInput,
  ) => Promise<void> | void
  onUpsertItem: (
    closingId: Id<"dailyClosings">,
    input: UpsertItemInput,
  ) => Promise<void> | void
  onCloseDay: (
    closingId: Id<"dailyClosings">,
    input: CloseDayInput,
  ) => Promise<void> | void
  onApprove: (closingId: Id<"dailyClosings">) => Promise<void> | void
}

export function CloseDayWizard({
  workspaceId,
  closing,
  onClose,
  onRecordSales,
  onUpsertItem,
  onCloseDay,
  onApprove,
}: Props) {
  const done = completedSteps(closing.status)
  const autoStep = currentStep(closing.status)
  const [activeStep, setActiveStep] = useState<StepKey>(autoStep)
  const [busy, setBusy] = useState(false)

  // Re-sync the active step when the closing status flips (e.g. after saving).
  useEffect(() => {
    setActiveStep(currentStep(closing.status))
  }, [closing.status])

  const { items } = useDailyClosingItems(workspaceId, closing._id)

  const variance = useMemo(
    () => items.reduce((acc, it) => acc + it.variance, 0),
    [items],
  )

  const runApprove = async () => {
    setBusy(true)
    try {
      await onApprove(closing._id)
    } finally {
      setBusy(false)
    }
  }

  // A step button is selectable once its predecessor is done OR it's the auto step.
  const stepSelectable = (key: StepKey): boolean => {
    if (key === "open") return true
    if (key === "sales") return done.open
    if (key === "variance") return done.sales
    if (key === "close") return done.sales
    if (key === "approve") return done.close
    return false
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between border-b p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Daily closing
          </p>
          <h2 className="truncate text-lg font-semibold">{closing.businessDate}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {closing.branchId ? `Branch: ${closing.branchId} · ` : ""}
            Opened {formatRelativeTime(closing.openedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ClosingStateBadge status={closing.status} />
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-1 border-b bg-muted/30 px-3 py-2 text-xs">
        {STEPS.map((s, idx) => {
          const isActive = s.key === activeStep
          const isDone = done[s.key]
          const canSelect = stepSelectable(s.key)
          return (
            <div key={s.key} className="flex items-center gap-1">
              <button
                type="button"
                disabled={!canSelect}
                onClick={() => setActiveStep(s.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 transition-colors",
                  isActive
                    ? "border-primary bg-primary/10 font-semibold text-primary"
                    : isDone
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-transparent text-muted-foreground hover:bg-background",
                  !canSelect && "cursor-not-allowed opacity-50",
                )}
              >
                <s.Icon className="h-3 w-3" />
                <span>{idx + 1}. {s.label}</span>
                {isDone ? (
                  <CheckCircle className="h-3 w-3 text-emerald-500" />
                ) : null}
              </button>
              {idx < STEPS.length - 1 ? (
                <span className="text-muted-foreground/60">›</span>
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="flex-1 overflow-auto p-4 text-sm">
        {activeStep === "open" ? (
          <StepOpen closing={closing} />
        ) : activeStep === "sales" ? (
          <StepSales
            closing={closing}
            readOnly={closing.status === "approved" || closing.status === "closed"}
            busy={busy}
            onSave={async (input) => {
              setBusy(true)
              try {
                await onRecordSales(closing._id, input)
                setActiveStep("variance")
              } finally {
                setBusy(false)
              }
            }}
          />
        ) : activeStep === "variance" ? (
          <StepVariance
            items={items}
            readOnly={closing.status === "approved"}
            busy={busy}
            onUpsert={async (input) => {
              setBusy(true)
              try {
                await onUpsertItem(closing._id, input)
              } finally {
                setBusy(false)
              }
            }}
          />
        ) : activeStep === "close" ? (
          <StepClose
            closing={closing}
            busy={busy}
            readOnly={closing.status === "approved" || closing.status === "closed"}
            onSave={async (input) => {
              setBusy(true)
              try {
                await onCloseDay(closing._id, input)
                setActiveStep("approve")
              } finally {
                setBusy(false)
              }
            }}
          />
        ) : (
          <StepApprove
            closing={closing}
            paymentMethodVariance={variance}
            itemCount={items.length}
          />
        )}
      </div>

      {/* Footer action bar */}
      {activeStep === "approve" && closing.status === "closed" ? (
        <div className="border-t bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              Review the numbers above. Approving locks this closing.
            </p>
            <Button size="sm" disabled={busy} onClick={runApprove} className="gap-1.5">
              <CheckCircle className="h-3.5 w-3.5" />
              {busy ? "Approving…" : "Approve closing"}
            </Button>
          </div>
        </div>
      ) : activeStep === "approve" && closing.status === "approved" ? (
        <div className="border-t bg-muted/30 p-3 text-right text-xs text-muted-foreground">
          Closing approved {closing.approvedAt ? formatRelativeTime(closing.approvedAt) : ""}
        </div>
      ) : activeStep === "approve" && closing.status === "disputed" ? (
        <div className="border-t bg-muted/30 p-3 text-right text-xs text-red-600">
          Closing is disputed — resolve via an upstream mutation before approving.
        </div>
      ) : null}
    </div>
  )
}

// ---------- step bodies ----------

function StepOpen({ closing }: { closing: DailyClosing }) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Open</p>
      <div className="rounded-md border bg-muted/30 p-3">
        <dl className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Business date</dt>
          <dd className="col-span-2 font-mono">{closing.businessDate}</dd>

          <dt className="text-muted-foreground">Branch</dt>
          <dd className="col-span-2">{closing.branchId ?? "—"}</dd>

          <dt className="text-muted-foreground">Opened</dt>
          <dd className="col-span-2">{formatRelativeTime(closing.openedAt)}</dd>

          <dt className="text-muted-foreground">Opened by</dt>
          <dd className="col-span-2 truncate font-mono text-xs">
            {String(closing.openedBy)}
          </dd>
        </dl>
      </div>
      <p className="text-xs text-muted-foreground">
        The day is already open. Move on to &quot;Sales&quot; to log cash, card, QRIS, and
        other totals for the shift.
      </p>
    </div>
  )
}

function StepSales({
  closing,
  readOnly,
  busy,
  onSave,
}: {
  closing: DailyClosing
  readOnly: boolean
  busy: boolean
  onSave: (input: RecordSalesInput) => Promise<void> | void
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Record sales
      </p>
      <RecordSalesForm
        defaults={{
          cashSales: closing.cashSales,
          cardSales: closing.cardSales,
          qrisSales: closing.qrisSales,
          otherSales: closing.otherSales,
        }}
        readOnly={readOnly}
        busy={busy}
        onSubmit={onSave}
      />
    </div>
  )
}

function StepVariance({
  items,
  readOnly,
  busy,
  onUpsert,
}: {
  items: ReturnType<typeof useDailyClosingItems>["items"]
  readOnly: boolean
  busy: boolean
  onUpsert: (input: UpsertItemInput) => Promise<void> | void
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Track variance per payment method. Every row stores expected vs actual —
        positive variance is an overage, negative is a shortage.
      </p>
      <PaymentMethodVariance
        items={items}
        readOnly={readOnly}
        busy={busy}
        onUpsert={onUpsert}
      />
    </div>
  )
}

function StepClose({
  closing,
  busy,
  readOnly,
  onSave,
}: {
  closing: DailyClosing
  busy: boolean
  readOnly: boolean
  onSave: (input: CloseDayInput) => Promise<void> | void
}) {
  const expectedCash = closing.expectedCash ?? closing.cashSales ?? 0
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">Close day</p>
      <CloseDayForm
        expectedCash={expectedCash}
        totalSales={closing.totalSales}
        defaults={{
          actualCash: closing.actualCash ?? expectedCash,
          closingNotes: closing.closingNotes ?? "",
        }}
        readOnly={readOnly}
        busy={busy}
        onSubmit={onSave}
      />
    </div>
  )
}

function StepApprove({
  closing,
  paymentMethodVariance,
  itemCount,
}: {
  closing: DailyClosing
  paymentMethodVariance: number
  itemCount: number
}) {
  const pmColor =
    paymentMethodVariance === 0
      ? "text-muted-foreground"
      : paymentMethodVariance > 0
        ? "text-emerald-600"
        : "text-red-600"
  const diffColor =
    closing.difference === undefined || closing.difference === null
      ? "text-muted-foreground"
      : closing.difference === 0
        ? "text-muted-foreground"
        : closing.difference > 0
          ? "text-emerald-600"
          : "text-red-600"

  return (
    <div className="space-y-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        Review & approve
      </p>

      <div className="rounded-md border bg-muted/30 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Status</span>
          <ClosingStateBadge status={closing.status} />
        </div>
        <Separator className="my-2" />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Total sales</dt>
          <dd className="text-right font-medium">{formatIDR(closing.totalSales)}</dd>

          <dt className="text-muted-foreground">Cash sales</dt>
          <dd className="text-right">{formatIDR(closing.cashSales)}</dd>

          <dt className="text-muted-foreground">Card sales</dt>
          <dd className="text-right">{formatIDR(closing.cardSales)}</dd>

          <dt className="text-muted-foreground">QRIS sales</dt>
          <dd className="text-right">{formatIDR(closing.qrisSales)}</dd>

          <dt className="text-muted-foreground">Other sales</dt>
          <dd className="text-right">{formatIDR(closing.otherSales)}</dd>

          <dt className="text-muted-foreground">Expected cash</dt>
          <dd className="text-right">{formatIDR(closing.expectedCash)}</dd>

          <dt className="text-muted-foreground">Actual cash</dt>
          <dd className="text-right">{formatIDR(closing.actualCash)}</dd>

          <dt className="text-muted-foreground">Cash difference</dt>
          <dd className={cn("text-right font-semibold", diffColor)}>
            {formatSignedIDR(closing.difference)}
          </dd>
        </dl>
      </div>

      <div className="rounded-md border p-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Payment-method variance ({itemCount} {itemCount === 1 ? "row" : "rows"})
          </span>
          <Badge variant="outline" className={cn("font-mono text-[10px]", pmColor)}>
            {formatSignedIDR(paymentMethodVariance)}
          </Badge>
        </div>
      </div>

      {closing.closingNotes ? (
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Closing notes
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{closing.closingNotes}</p>
        </div>
      ) : null}

      {closing.approvedAt ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          Approved {formatRelativeTime(closing.approvedAt)} by {String(closing.approvedBy ?? "—")}
        </div>
      ) : null}
    </div>
  )
}
