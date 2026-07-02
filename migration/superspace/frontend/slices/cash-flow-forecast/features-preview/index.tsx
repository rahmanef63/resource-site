"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { CashFlowStatsCards } from "../components/CashFlowStatsCards"
import { ForecastList } from "../components/ForecastList"
import type { ForecastSummary } from "../types"

const _id = (raw: string) => raw as unknown as ForecastSummary["_id"]
const _wsId = "ws_demo" as unknown as ForecastSummary["workspaceId"]
const _userId = "user_demo" as unknown as ForecastSummary["generatedBy"]
const NOW = Date.now()

const MOCK_FORECASTS: ForecastSummary[] = [
  {
    _id: _id("f_1"),
    workspaceId: _wsId,
    branchId: "main",
    horizonDays: 30,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    baseCash: 250_000_000,
    projectedInflow: 480_000_000,
    projectedOutflow: 395_000_000,
    projectedClosing: 335_000_000,
    confidence: 0.78,
    status: "published",
    generatedBy: _userId,
    generationSource: "ai-assisted",
    publishedAt: NOW - 86_400_000 * 7,
    createdAt: NOW - 86_400_000 * 8,
    updatedAt: NOW - 86_400_000 * 7,
  },
  {
    _id: _id("f_2"),
    workspaceId: _wsId,
    branchId: "main",
    horizonDays: 30,
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    baseCash: 335_000_000,
    projectedInflow: 510_000_000,
    projectedOutflow: 410_000_000,
    projectedClosing: 435_000_000,
    confidence: 0.65,
    status: "draft",
    generatedBy: _userId,
    generationSource: "manual",
    createdAt: NOW - 86_400_000 * 2,
    updatedAt: NOW - 86_400_000,
  },
  {
    _id: _id("f_3"),
    workspaceId: _wsId,
    horizonDays: 90,
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    baseCash: 250_000_000,
    projectedInflow: 1_540_000_000,
    projectedOutflow: 1_245_000_000,
    projectedClosing: 545_000_000,
    confidence: 0.55,
    status: "archived",
    generatedBy: _userId,
    generationSource: "recurring-derived",
    createdAt: NOW - 86_400_000 * 60,
    updatedAt: NOW - 86_400_000 * 30,
  },
]

function CashFlowForecastPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Cash Flow Forecast</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          1 published · 1 draft · 1 archived
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <CashFlowStatsCards
        latestPublished={MOCK_FORECASTS.find((f) => f.status === "published") ?? null}
        forecasts={MOCK_FORECASTS}
        totalDraftLineItems={6}
      />
      <ForecastList items={MOCK_FORECASTS} onSelect={() => { /* preview: no-op */ }} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "cash-flow-forecast",
  name: "Cash Flow Forecast",
  description: "Plan projected inflow/outflow per horizon — draft, publish, archive.",
  component: CashFlowForecastPreview,
  category: "finance",
  tags: ["cashflow", "forecast", "finance", "planning"],
  mockDataSets: [
    {
      id: "default",
      name: "Monthly + quarterly forecasts",
      description: "Published April + draft May + archived Q2 forecast.",
      data: { forecasts: MOCK_FORECASTS },
    },
  ],
})
