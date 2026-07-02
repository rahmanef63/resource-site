"use client"

import React, { useMemo, useState } from "react"
import { TrendingUp } from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { FeatureShell } from "@/frontend/shared/ui/layout/feature-shell"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCashFlowForecasts } from "../hooks/useCashFlow"
import { CashFlowStatsCards } from "../components/CashFlowStatsCards"
import { ForecastList } from "../components/ForecastList"
import { ForecastCreateDialog } from "../components/ForecastCreateDialog"
import { ForecastDetailDrawer } from "../components/ForecastDetailDrawer"
import type { ForecastStatus, ForecastSummary } from "../types"

interface CashFlowForecastPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function CashFlowForecastPage({ workspaceId }: CashFlowForecastPageProps) {
  const [statusFilter, setStatusFilter] = useState<ForecastStatus | "all">("all")
  const [selectedId, setSelectedId] = useState<Id<"cashFlowForecasts"> | null>(null)

  const {
    forecasts,
    latestPublished,
    selectedForecast,
    isLoading,
    isDetailLoading,
    createForecast,
    addLineItem,
    publishForecast,
  } = useCashFlowForecasts(workspaceId, {
    status: statusFilter,
    selectedForecastId: selectedId,
  })

  const filtered = useMemo<ForecastSummary[]>(
    () => forecasts,
    [forecasts],
  )

  // Counts for tab labels — rely on the unfiltered status-agnostic hook call would
  // duplicate data; keep approximate counts based on the current list to stay simple.
  // When a status filter is active we only display those; show "—" for other counts.
  const counts = useMemo(() => {
    if (statusFilter !== "all") return null
    return {
      all: forecasts.length,
      draft: forecasts.filter((f) => f.status === "draft").length,
      published: forecasts.filter((f) => f.status === "published").length,
      archived: forecasts.filter((f) => f.status === "archived").length,
    }
  }, [forecasts, statusFilter])

  // Rough estimate of draft line items for stats card. The detail query only loads
  // line items for the selected forecast; show the count from the loaded detail
  // when that detail is a draft, otherwise show 0 as a placeholder.
  const totalDraftLineItems =
    selectedForecast && selectedForecast.status === "draft"
      ? selectedForecast.items.length
      : 0

  if (!workspaceId) {
    return (
      <FeatureShell featureId="cash-flow-forecast" padding centered>
        <div className="text-center">
          <TrendingUp className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">No workspace selected</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a workspace to build and publish cash-flow forecasts.
          </p>
        </div>
      </FeatureShell>
    )
  }

  const selectedSummary = selectedId ? forecasts.find((f) => f._id === selectedId) : null
  const inspectorForecast = selectedForecast ?? null

  return (
    <FeatureShell
      featureId="cash-flow-forecast"
      padding
      maxWidth="full"
      aiPlaceholder="Ask about cash flow, projected closing, publish gates…"
      inspector={
        selectedId ? (
          <ForecastDetailDrawer
            forecast={inspectorForecast}
            isLoading={isDetailLoading}
            onClose={() => setSelectedId(null)}
            onAddLineItem={addLineItem}
            onPublish={async (id) => {
              await publishForecast(id)
            }}
          />
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-semibold">
              <TrendingUp className="h-5 w-5" />
              Cash Flow Forecast
            </h1>
            <p className="text-sm text-muted-foreground">
              Project inflow, outflow, and closing balance from bucketed revenue and
              expense line items. Draft first — publish when confident.
            </p>
          </div>
          <ForecastCreateDialog onCreate={createForecast} />
        </div>

        <CashFlowStatsCards
          latestPublished={latestPublished}
          forecasts={forecasts}
          totalDraftLineItems={totalDraftLineItems}
        />

        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as ForecastStatus | "all")}
        >
          <TabsList className="inline-flex flex-wrap">
            <TabsTrigger value="all">
              All{counts ? ` (${counts.all})` : ""}
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft{counts ? ` (${counts.draft})` : ""}
            </TabsTrigger>
            <TabsTrigger value="published">
              Published{counts ? ` (${counts.published})` : ""}
            </TabsTrigger>
            <TabsTrigger value="archived">
              Archived{counts ? ` (${counts.archived})` : ""}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
            Loading cash-flow forecasts…
          </div>
        ) : (
          <ForecastList
            items={filtered}
            onSelect={(row) => {
              setSelectedId(row._id)
              // keep summary for immediate feedback while detail loads
              void selectedSummary
            }}
            emptyAction={<ForecastCreateDialog onCreate={createForecast} />}
          />
        )}
      </div>
    </FeatureShell>
  )
}
