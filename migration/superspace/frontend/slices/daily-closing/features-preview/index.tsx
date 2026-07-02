"use client"

import * as React from "react"
import { defineFeaturePreview } from "@/frontend/shared/preview"
import type { FeaturePreviewProps } from "@/frontend/shared/preview"

import { ClosingStatsCards } from "../components/ClosingStatsCards"
import { ClosingList } from "../components/ClosingList"
import type { DailyClosing, DailyClosingSummary } from "../types"

const _id = (raw: string) => raw as unknown as DailyClosing["_id"]
const _wsId = "ws_demo" as unknown as DailyClosing["workspaceId"]
const _userId = "user_demo" as unknown as DailyClosing["openedBy"]
const NOW = Date.now()
const day = (offset: number) => new Date(NOW - 86_400_000 * offset).toISOString().slice(0, 10)

const MOCK_CLOSINGS: DailyClosing[] = [
  {
    _id: _id("c_1"), workspaceId: _wsId, branchId: "main",
    businessDate: day(0), openedAt: NOW - 3_600_000 * 8, openedBy: _userId,
    cashSales: 4_200_000, cardSales: 6_800_000, qrisSales: 3_500_000, otherSales: 0,
    totalSales: 14_500_000,
    status: "open",
    createdAt: NOW - 3_600_000 * 8, updatedAt: NOW - 3_600_000 * 1,
  },
  {
    _id: _id("c_2"), workspaceId: _wsId, branchId: "main",
    businessDate: day(1), openedAt: NOW - 86_400_000 - 3_600_000 * 8,
    openedBy: _userId, closedAt: NOW - 86_400_000 + 3_600_000 * 2, closedBy: _userId,
    expectedCash: 4_500_000, actualCash: 4_485_000, difference: -15_000,
    cashSales: 4_500_000, cardSales: 7_200_000, qrisSales: 3_900_000, otherSales: 0,
    totalSales: 15_600_000, status: "closed",
    closingNotes: "Minor short — likely change-jar drift.",
    createdAt: NOW - 86_400_000 - 3_600_000 * 8, updatedAt: NOW - 86_400_000 + 3_600_000 * 2,
  },
  {
    _id: _id("c_3"), workspaceId: _wsId, branchId: "main",
    businessDate: day(2), openedAt: NOW - 86_400_000 * 2 - 3_600_000 * 8, openedBy: _userId,
    closedAt: NOW - 86_400_000 * 2 + 3_600_000 * 2, closedBy: _userId,
    approvedAt: NOW - 86_400_000 * 2 + 3_600_000 * 4, approvedBy: _userId,
    expectedCash: 5_100_000, actualCash: 5_100_000, difference: 0,
    cashSales: 5_100_000, cardSales: 6_900_000, qrisSales: 4_200_000, otherSales: 0,
    totalSales: 16_200_000, status: "approved",
    createdAt: NOW - 86_400_000 * 2 - 3_600_000 * 8, updatedAt: NOW - 86_400_000 * 2 + 3_600_000 * 4,
  },
]

const MOCK_SUMMARY: DailyClosingSummary = {
  last30Days: 28,
  openCount: 1,
  totalSales: MOCK_CLOSINGS.reduce((s, c) => s + (c.totalSales ?? 0), 0),
  totalVariance: -15_000,
}

function DailyClosingPreview({ compact }: FeaturePreviewProps) {
  if (compact) {
    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-semibold">Daily Closing</h3>
        <p className="mt-2 text-xs text-muted-foreground">
          1 open day · 28 closed in last 30 days
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <ClosingStatsCards summary={MOCK_SUMMARY} />
      <ClosingList items={MOCK_CLOSINGS} onSelect={() => { /* preview: no-op */ }} />
    </div>
  )
}

export default defineFeaturePreview({
  featureId: "daily-closing",
  name: "Daily Closing",
  description: "End-of-day cash count, sales reconciliation, and approval flow.",
  component: DailyClosingPreview,
  category: "operations",
  tags: ["closing", "cash", "reconciliation", "approval"],
  mockDataSets: [
    {
      id: "default",
      name: "Coffee shop closings",
      description: "Today open, yesterday closed with minor variance, day before approved.",
      data: { closings: MOCK_CLOSINGS, summary: MOCK_SUMMARY },
    },
  ],
})
