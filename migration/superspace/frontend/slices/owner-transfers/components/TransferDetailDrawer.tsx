"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatRelativeTime } from "@/frontend/shared/foundation/utils/core/format"
import { PanelSection } from "@/frontend/shared/ui/layout/container/three-column"
import type { Id } from "@convex/_generated/dataModel"
import { TransferStateBadge } from "./TransferStateBadge"
import { availableActions } from "../hooks/useOwnerTransfers"
import type { OwnerTransfer } from "../types"
import { TRANSFER_TYPE_LABELS } from "../types"
import { formatAmount } from "../lib/format"

interface Props {
  transfer: OwnerTransfer | null
  onClose: () => void
  onApprove: (id: Id<"ownerTransfers">) => Promise<void> | void
  onReconcile: (id: Id<"ownerTransfers">) => Promise<void> | void
}

export function TransferDetailDrawer({ transfer, onClose, onApprove, onReconcile }: Props) {
  const [busy, setBusy] = useState(false)

  if (!transfer) return null

  const actions = availableActions(transfer.status)

  const runAction = async (id: "approve" | "reconcile") => {
    setBusy(true)
    try {
      if (id === "approve") await onApprove(transfer._id)
      else await onReconcile(transfer._id)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PanelSection>
      <PanelSection.Header className="flex items-start justify-between p-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Owner transfer</p>
          <h2 className="text-lg font-semibold">{formatAmount(transfer.amount, transfer.currency)}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {TRANSFER_TYPE_LABELS[transfer.type]} · {transfer.transferDate}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TransferStateBadge status={transfer.status} />
          <Button aria-label="Close" variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </PanelSection.Header>

      <PanelSection.Items className="p-4 text-sm">
        <dl className="grid grid-cols-3 gap-x-4 gap-y-3">
          <dt className="text-muted-foreground">From account</dt>
          <dd className="col-span-2 truncate">{transfer.fromAccount ?? "—"}</dd>

          <dt className="text-muted-foreground">To account</dt>
          <dd className="col-span-2 truncate">{transfer.toAccount ?? "—"}</dd>

          <dt className="text-muted-foreground">Branch</dt>
          <dd className="col-span-2 truncate">{transfer.branchId ?? "—"}</dd>

          <dt className="text-muted-foreground">Category</dt>
          <dd className="col-span-2 truncate">{transfer.category ?? "—"}</dd>

          <dt className="text-muted-foreground">Created</dt>
          <dd className="col-span-2">{formatRelativeTime(transfer.createdAt)}</dd>

          {transfer.approvedAt ? (
            <>
              <dt className="text-muted-foreground">Approved</dt>
              <dd className="col-span-2">{formatRelativeTime(transfer.approvedAt)}</dd>
            </>
          ) : null}

          {transfer.reconciledAt ? (
            <>
              <dt className="text-muted-foreground">Reconciled</dt>
              <dd className="col-span-2">{formatRelativeTime(transfer.reconciledAt)}</dd>
            </>
          ) : null}
        </dl>

        {transfer.notes ? (
          <>
            <Separator className="my-4" />
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">{transfer.notes}</p>
          </>
        ) : null}
      </PanelSection.Items>

      {actions.length > 0 ? (
        <PanelSection.Footer className="p-3">
          <div className="flex items-center justify-end gap-2">
            {actions.map((a) => (
              <Button
                key={a.id}
                size="sm"
                disabled={busy}
                onClick={() => runAction(a.id)}
                className="gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                {a.label}
              </Button>
            ))}
          </div>
        </PanelSection.Footer>
      ) : null}
    </PanelSection>
  )
}
