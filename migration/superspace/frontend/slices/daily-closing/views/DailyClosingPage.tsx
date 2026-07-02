"use client"

import React, { useEffect, useMemo, useState } from "react"
import { ClipboardList } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDailyClosing } from "../hooks/useDailyClosing"
import { ClosingStatsCards } from "../components/ClosingStatsCards"
import { ClosingList } from "../components/ClosingList"
import { OpenDayDialog } from "../components/OpenDayDialog"
import { CloseDayWizard } from "../components/CloseDayWizard"
import type { ClosingStatus, DailyClosing } from "../types"

type StatusTab = "all" | ClosingStatus

interface DailyClosingPageProps {
  workspaceId?: Id<"workspaces"> | null
}

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export default function DailyClosingPage({ workspaceId }: DailyClosingPageProps) {
  const {
    items,
    summary,
    isLoading,
    openDay,
    recordSales,
    upsertItem,
    closeDay,
    approveClosing,
    deleteClosing,
  } = useDailyClosing(workspaceId)

  const [statusFilter, setStatusFilter] = useState<StatusTab>("all")
  const [selected, setSelected] = useState<DailyClosing | null>(null)

  // Keep inspector-bound selection in sync with live list updates.
  useEffect(() => {
    if (!selected) return
    const live = items.find((i) => i._id === selected._id)
    if (live && live !== selected) setSelected(live)
  }, [items, selected])

  const filtered = useMemo(() => {
    if (statusFilter === "all") return items
    return items.filter((i) => i.status === statusFilter)
  }, [items, statusFilter])

  const todaysClosing = useMemo(() => {
    const today = todayISO()
    return items.find((i) => i.businessDate === today) ?? null
  }, [items])

  const counts = useMemo(() => {
    const c: Record<ClosingStatus, number> = {
      open: 0,
      recorded: 0,
      closed: 0,
      approved: 0,
      disputed: 0,
    }
    for (const i of items) c[i.status] = (c[i.status] ?? 0) + 1
    return c
  }, [items])

  if (!workspaceId) {
    return (
      <FeatureShell featureId="daily-closing" padding centered>
        <div className="text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workspace to manage daily closings.
          </p>
        </div>
      </FeatureShell>
    )
  }

  const inspector = selected ? (
    <CloseDayWizard
      workspaceId={workspaceId}
      closing={selected}
      onClose={() => setSelected(null)}
      onRecordSales={async (id, input) => {
        await recordSales(id, input)
      }}
      onUpsertItem={async (id, input) => {
        await upsertItem(id, input)
      }}
      onCloseDay={async (id, input) => {
        await closeDay(id, input)
      }}
      onApprove={async (id) => {
        await approveClosing(id)
      }}
    />
  ) : undefined

  return (
    <FeatureShell
      featureId="daily-closing"
      padding
      maxWidth="full"
      aiPlaceholder="Ask about today's closing, variance by payment method, approval gates…"
      inspector={inspector}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <ClipboardList className="h-5 w-5" />
              Daily Closing
            </h1>
            <p className="text-sm text-muted-foreground">
              End-of-day register close with per-payment-method variance and approval workflow.
            </p>
          </div>
          {!todaysClosing ? (
            <OpenDayDialog
              onOpen={async (input) => {
                const result = await openDay(input)
                return result
              }}
            />
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
              onClick={() => setSelected(todaysClosing)}
            >
              View today&apos;s close ({todaysClosing.status})
            </button>
          )}
        </div>

        <ClosingStatsCards summary={summary} />

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusTab)}>
          <TabsList className="inline-flex flex-wrap">
            <TabsTrigger value="all">All ({items.length})</TabsTrigger>
            <TabsTrigger value="open">Open ({counts.open})</TabsTrigger>
            <TabsTrigger value="recorded">Recorded ({counts.recorded})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({counts.closed})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
            {counts.disputed > 0 ? (
              <TabsTrigger value="disputed">Disputed ({counts.disputed})</TabsTrigger>
            ) : null}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading daily closings…
          </div>
        ) : (
          <ClosingList
            items={filtered}
            onSelect={setSelected}
            onDelete={async (row) => {
              await deleteClosing(row._id)
              if (selected?._id === row._id) setSelected(null)
            }}
            emptyAction={
              !todaysClosing ? (
                <OpenDayDialog
                  onOpen={async (input) => {
                    await openDay(input)
                  }}
                />
              ) : undefined
            }
          />
        )}
      </div>
    </FeatureShell>
  )
}
