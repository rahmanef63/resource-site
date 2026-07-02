"use client"

import React, { useMemo, useState } from "react"
import { Wallet } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePettyCash } from "../hooks/usePettyCash"
import { RequestStatsCards } from "../components/RequestStatsCards"
import { RequestList } from "../components/RequestList"
import { RequestCreateDialog } from "../components/RequestCreateDialog"
import { RequestDetailDrawer } from "../components/RequestDetailDrawer"
import type { PettyCashRequest } from "../types"

type StatusTab =
  | "all"
  | "pending"
  | "approved"
  | "disbursed"
  | "closed"
  | "inactive" // rejected + cancelled

interface PettyCashPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function PettyCashPage({ workspaceId }: PettyCashPageProps) {
  const {
    items,
    summary,
    isLoading,
    createRequest,
    approveRequest,
    rejectRequest,
    disburseRequest,
    closeRequest,
    cancelRequest,
    deleteRequest,
  } = usePettyCash(workspaceId)

  const [statusFilter, setStatusFilter] = useState<StatusTab>("all")
  const [selected, setSelected] = useState<PettyCashRequest | null>(null)

  const filtered = useMemo(() => {
    if (statusFilter === "all") return items
    if (statusFilter === "inactive") {
      return items.filter((i) => i.status === "rejected" || i.status === "cancelled")
    }
    return items.filter((i) => i.status === statusFilter)
  }, [items, statusFilter])

  const inactiveCount = useMemo(
    () => items.filter((i) => i.status === "rejected" || i.status === "cancelled").length,
    [items],
  )

  if (!workspaceId) {
    return (
      <FeatureShell featureId="petty-cash" padding centered>
        <div className="text-center">
          <Wallet className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workspace to manage petty cash requests.
          </p>
        </div>
      </FeatureShell>
    )
  }

  const refreshSelected = (id: Id<"pettyCashRequests">) => {
    const updated = items.find((i) => i._id === id)
    setSelected(updated ?? null)
  }

  return (
    <FeatureShell
      featureId="petty-cash"
      padding
      maxWidth="full"
      aiPlaceholder="Ask about petty cash requests, approvals, disbursements, variance…"
      inspector={
        selected ? (
          <RequestDetailDrawer
            request={selected}
            onClose={() => setSelected(null)}
            onApprove={async (id) => {
              await approveRequest(id)
              refreshSelected(id)
            }}
            onReject={async (id, input) => {
              await rejectRequest(id, input)
              refreshSelected(id)
            }}
            onDisburse={async (id, input) => {
              await disburseRequest(id, input)
              refreshSelected(id)
            }}
            onCloseRequest={async (id, input) => {
              await closeRequest(id, input)
              refreshSelected(id)
            }}
            onCancel={async (id) => {
              await cancelRequest(id)
              refreshSelected(id)
            }}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <Wallet className="h-5 w-5" />
              Petty Cash
            </h1>
            <p className="text-sm text-muted-foreground">
              Request → approval → disbursement → close. Variance is tracked on every close.
            </p>
          </div>
          <RequestCreateDialog onCreate={createRequest} />
        </div>

        <RequestStatsCards summary={summary} />

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusTab)}>
          <TabsList className="inline-flex flex-wrap">
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({items.filter((i) => i.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({items.filter((i) => i.status === "approved").length})
            </TabsTrigger>
            <TabsTrigger value="disbursed">
              Disbursed ({items.filter((i) => i.status === "disbursed").length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed ({items.filter((i) => i.status === "closed").length})
            </TabsTrigger>
            <TabsTrigger value="inactive">Rejected/Cancelled ({inactiveCount})</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading petty cash requests…
          </div>
        ) : (
          <RequestList
            items={filtered}
            onSelect={setSelected}
            onDelete={async (row) => {
              await deleteRequest(row._id)
              if (selected?._id === row._id) setSelected(null)
            }}
            emptyAction={<RequestCreateDialog onCreate={createRequest} />}
          />
        )}
      </div>
    </FeatureShell>
  )
}
