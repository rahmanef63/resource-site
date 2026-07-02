"use client"

import React, { useMemo, useState } from "react"
import { ArrowLeftRight } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useOwnerTransfers } from "../hooks/useOwnerTransfers"
import { TransferStatsCards } from "../components/TransferStatsCards"
import { TransferList } from "../components/TransferList"
import { TransferCreateDialog } from "../components/TransferCreateDialog"
import { TransferDetailDrawer } from "../components/TransferDetailDrawer"
import type { OwnerTransfer, TransferStatus } from "../types"

interface OwnerTransfersPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function OwnerTransfersPage({ workspaceId }: OwnerTransfersPageProps) {
  const { items, summary, isLoading, createTransfer, approveTransfer, reconcileTransfer } =
    useOwnerTransfers(workspaceId)
  const [statusFilter, setStatusFilter] = useState<TransferStatus | "all">("all")
  const [selected, setSelected] = useState<OwnerTransfer | null>(null)

  const filtered = useMemo(
    () => (statusFilter === "all" ? items : items.filter((i) => i.status === statusFilter)),
    [items, statusFilter],
  )

  if (!workspaceId) {
    return (
      <FeatureShell featureId="owner-transfers" padding centered>
        <div className="text-center">
          <ArrowLeftRight className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workspace to track owner capital movements.
          </p>
        </div>
      </FeatureShell>
    )
  }

  return (
    <FeatureShell
      featureId="owner-transfers"
      padding
      maxWidth="full"
      aiPlaceholder="Ask about owner transfers, net position, pending approvals…"
      inspector={
        selected ? (
          <TransferDetailDrawer
            transfer={selected}
            onClose={() => setSelected(null)}
            onApprove={async (id) => {
              await approveTransfer(id)
              const updated = items.find((i) => i._id === id)
              setSelected(updated ?? null)
            }}
            onReconcile={async (id) => {
              await reconcileTransfer(id)
              const updated = items.find((i) => i._id === id)
              setSelected(updated ?? null)
            }}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <ArrowLeftRight className="h-5 w-5" />
              Owner Transfers
            </h1>
            <p className="text-sm text-muted-foreground">
              Withdrawals, capital injections, loans, and repayments — awaiting approval before reconciliation.
            </p>
          </div>
          <TransferCreateDialog onCreate={createTransfer} />
        </div>

        <TransferStatsCards summary={summary} />

        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as TransferStatus | "all")}
        >
          <TabsList className="inline-flex flex-wrap">
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({items.filter((i) => i.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({items.filter((i) => i.status === "approved").length})
            </TabsTrigger>
            <TabsTrigger value="reconciled">
              Reconciled ({items.filter((i) => i.status === "reconciled").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({items.filter((i) => i.status === "rejected").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading owner transfers…
          </div>
        ) : (
          <TransferList
            items={filtered}
            onSelect={setSelected}
            emptyAction={<TransferCreateDialog onCreate={createTransfer} />}
          />
        )}
      </div>
    </FeatureShell>
  )
}
